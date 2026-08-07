from pathlib import Path

BASE_DIR = Path(__file__).parent

def load_prompt(character="rocky"):
    folder = BASE_DIR / character
    return (folder / "prompt.txt").read_text(encoding="utf-8")