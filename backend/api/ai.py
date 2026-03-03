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
    'Output JSON only. Keys: "name" (string or null), "reason" (string). '
    '"name" must be exactly one of the provided category names or null. '
    '"reason" is a short explanation.'
)


def _validate_openai_output(data: dict, allowed_names: list[str]) -> dict:
    """Validate and normalize OpenAI response. Returns {name, reason} or raises."""
    if not isinstance(data, dict):
        raise ValueError("Expected object")
    if "name" not in data or "reason" not in data:
        raise ValueError("Missing required keys: name, reason")
    name = data["name"]
    reason = data["reason"]
    if not isinstance(reason, str):
        reason = str(reason) if reason is not None else "Suggested"
    if name is None:
        return {"name": None, "reason": reason}
    name = str(name).strip() if isinstance(name, str) else str(name)
    if not name:
        return {"name": None, "reason": reason}
    allowed_lower = {n.lower(): n for n in allowed_names}
    matched = allowed_lower.get(name.lower())
    if matched is None:
        return {"name": None, "reason": reason}
    return {"name": matched, "reason": reason}


def _openai_suggest(categories: list[str], title: str, content: str) -> dict:
    """Call OpenAI Chat Completions to suggest a category."""
    try:
        from openai import OpenAI
    except ImportError:
        logger.warning("openai package not installed")
        return AI_UNAVAILABLE

    api_key = getattr(settings, "OPENAI_API_KEY", "") or ""
    if not api_key.strip():
        logger.warning("OPENAI_API_KEY not set")
        return AI_UNAVAILABLE

    model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
    timeout = getattr(settings, "AI_REQUEST_TIMEOUT", 10.0)

    client = OpenAI(api_key=api_key, timeout=timeout)
    categories_str = ", ".join(repr(c) for c in categories) if categories else "[]"
    user_content = (
        f"Categories: {categories_str}. "
        f"Note title: {title[:150]!r}. Content: {content[:300]!r}. "
        "Suggest a category."
    )

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": _OPENAI_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            max_tokens=80,
            response_format={"type": "json_object"},
        )
        text = (response.choices[0].message.content or "").strip()
        if not text:
            return AI_UNAVAILABLE
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            logger.warning("OpenAI returned invalid JSON")
            return AI_UNAVAILABLE
        return _validate_openai_output(data, categories)
    except Exception as e:
        logger.warning("OpenAI suggest_category failed: %s", type(e).__name__)
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
