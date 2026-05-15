"""
ai_engine/client.py
-------------------
Low-level Anthropic API wrapper.
All other modules call call_claude() — nothing else touches the SDK directly.
"""

import anthropic
from django.conf import settings


def get_client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def call_claude(
    system_prompt: str,
    user_message: str,
    max_tokens: int = 1500,
    temperature: float = 0.0,   # Zero temp for deterministic JSON output
) -> str:
    """
    Sends a single-turn message to Claude Sonnet and returns the raw text response.
    Raises anthropic.APIError on failure — callers handle fallback.
    """
    if settings.ANTHROPIC_API_KEY.startswith("test-"):
        if "generate a concise, professional end-of-month" in system_prompt or "MONTHLY_SUMMARY_PROMPT" in system_prompt:
            return "This is a test AI summary."
        return '{"verdict": "verified", "score_impact": 0, "chain_issues": [], "summary": "Looks good.", "deduction_reason": null}'

    client = get_client()
    message = client.messages.create(
        model="claude-3-5-sonnet-latest",
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    return message.content[0].text
