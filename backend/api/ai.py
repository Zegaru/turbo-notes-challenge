"""
AI-powered category suggestion. Optional, testable via mock provider.
"""

import json
import logging

from django.conf import settings

logger = logging.getLogger(__name__)

AI_UNAVAILABLE = {"name": None, "reason": "AI unavailable"}


def _mock_suggest(categories: list[str], title: str, content: str) -> dict:
    """Deterministic mock: suggests first existing category or 'General' if none."""
    if categories:
        return {"name": categories[0], "reason": "Mock: first existing category"}
    return {"name": "General", "reason": "Mock: no categories yet"}


_OPENAI_SYSTEM_PROMPT = (
    "Suggest a category for the note based on its title and content. "
    "Return exactly one of the provided category names, or null if none fit. "
    "Provide a short reason for your suggestion."
)


def _build_category_schema(categories: list[str]) -> dict:
    """Build JSON schema for Structured Outputs. name must be one of categories or null."""
    name_enum: list = [None] + list(categories) if categories else [None]
    return {
        "type": "json_schema",
        "json_schema": {
            "name": "category_suggestion",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": ["string", "null"],
                        "description": "The suggested category name, must be exactly one of the provided category names or null if none fit",
                        "enum": name_enum,
                    },
                    "reason": {
                        "type": "string",
                        "description": "Short explanation for the suggestion",
                    },
                },
                "required": ["name", "reason"],
                "additionalProperties": False,
            },
        },
    }


def _normalize_parsed(parsed: dict, allowed_names: list[str]) -> dict:
    """Normalize parsed output: match name to allowed case, ensure reason is str."""
    name = parsed.get("name")
    reason = parsed.get("reason", "Suggested")
    if not isinstance(reason, str):
        reason = str(reason) if reason is not None else "Suggested"
    if name is None:
        return {"name": None, "reason": reason}
    name = str(name).strip() if isinstance(name, str) else str(name)
    if not name:
        return {"name": None, "reason": reason}
    allowed_lower = {n.lower(): n for n in allowed_names}
    matched = allowed_lower.get(name.lower())
    return {"name": matched, "reason": reason} if matched else {"name": None, "reason": reason}


def _openai_suggest(categories: list[str], title: str, content: str) -> dict:
    """Call OpenAI Chat Completions to suggest a category using Structured Outputs."""
    try:
        from openai import OpenAI
    except ImportError:
        logger.warning("openai package not installed")
        return AI_UNAVAILABLE

    api_key = getattr(settings, "OPENAI_API_KEY", "") or ""
    if not api_key.strip():
        logger.warning("OPENAI_API_KEY not set")
        return AI_UNAVAILABLE

    model = getattr(settings, "OPENAI_MODEL", "gpt-5-mini")
    timeout = getattr(settings, "AI_REQUEST_TIMEOUT", 10.0)

    client = OpenAI(api_key=api_key, timeout=timeout)
    categories_str = ", ".join(repr(c) for c in categories) if categories else "[]"
    user_content = (
        f"Categories: {categories_str}. "
        f"Note title: {title[:150]!r}. Content: {content[:300]!r}. "
        "Suggest a category."
    )

    try:
        response = client.chat.completions.parse(
            model=model,
            messages=[
                {"role": "system", "content": _OPENAI_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            response_format=_build_category_schema(categories),
        )
        msg = response.choices[0].message
        if getattr(msg, "refusal", None):
            logger.warning("OpenAI refused: %s", msg.refusal)
            return AI_UNAVAILABLE
        text = (msg.content or "").strip()
        if not text:
            return AI_UNAVAILABLE
        data = json.loads(text)
        return _normalize_parsed(data, categories)
    except Exception as e:
        logger.warning("OpenAI suggest_category failed: %s", e)
        return AI_UNAVAILABLE


_PROVIDERS = {
    "mock": _mock_suggest,
    "openai": _openai_suggest,
}


def suggest_category(categories: list[str], title: str, content: str) -> dict:
    """
    Suggest a category for a note based on title and content.

    Args:
        categories: Existing category names for the user.
        title: Note title.
        content: Note content.

    Returns:
        {"name": str | None, "reason": str}
        On provider errors, returns {"name": None, "reason": "AI unavailable"}.
    """
    provider_name = getattr(settings, "AI_PROVIDER", "mock").lower()
    provider = _PROVIDERS.get(provider_name, _mock_suggest)

    try:
        return provider(categories, title or "", content or "")
    except Exception as e:
        logger.exception("suggest_category failed: %s", e)
        return AI_UNAVAILABLE
