from api.ai import suggest_category


class TestSuggestCategoryMock:
    """Tests for suggest_category with mock provider (default)."""

    def test_returns_first_category_when_categories_exist(self):
        result = suggest_category(
            categories=["Work", "Personal"],
            title="Meeting notes",
            content="Discussed Q4 goals.",
        )
        assert result["name"] == "Work"
        assert "Mock" in result["reason"]

    def test_returns_general_when_no_categories(self):
        result = suggest_category(
            categories=[],
            title="Random note",
            content="Some text.",
        )
        assert result["name"] == "General"
        assert "Mock" in result["reason"]

    def test_handles_empty_title_and_content(self):
        result = suggest_category(categories=["A"], title="", content="")
        assert result["name"] == "A"
        assert "name" in result and "reason" in result

    def test_response_shape(self):
        result = suggest_category(categories=["X"], title="t", content="c")
        assert set(result.keys()) == {"name", "reason"}
        assert isinstance(result["name"], str)
        assert isinstance(result["reason"], str)
