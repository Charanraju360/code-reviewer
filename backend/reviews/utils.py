import zipfile
import os
import requests
import json
from django.core.files.uploadedfile import UploadedFile

# Allowed file extensions for review
ALLOWED_EXTENSIONS = {'.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.go', '.rb', '.php', '.css', '.html'}
MAX_FILES = 20
MAX_FILE_SIZE_CHARS = 8000  # Truncate large files


def extract_files_from_upload(uploaded_file: UploadedFile):
    """Extract supported files from an uploaded file (single file or .zip)."""
    files = {}
    name = uploaded_file.name

    if name.lower().endswith('.zip'):
        try:
            with zipfile.ZipFile(uploaded_file) as z:
                all_names = [n for n in z.namelist()
                             if not n.endswith('/')
                             and not n.startswith('__MACOSX')
                             and os.path.splitext(n)[1].lower() in ALLOWED_EXTENSIONS]
                for file_name in all_names[:MAX_FILES]:
                    try:
                        content = z.read(file_name).decode('utf-8', errors='ignore')
                        files[file_name] = content[:MAX_FILE_SIZE_CHARS]
                    except Exception:
                        continue
        except zipfile.BadZipFile:
            raise ValueError('Invalid zip file.')
    else:
        ext = os.path.splitext(name)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"File type '{ext}' not supported.")
        content = uploaded_file.read().decode('utf-8', errors='ignore')
        files[name] = content[:MAX_FILE_SIZE_CHARS]

    if not files:
        raise ValueError('No supported code files found in upload.')

    return files


def call_openrouter(filename: str, code_content: str):
    """Send a file's content to OpenRouter and return a list of comment dicts.
    Expected dict keys: line_number (int), severity (error|warning|suggestion), comment (str).
    """
    api_key = os.getenv('OPENROUTER_API_KEY')
    model = os.getenv('OPENROUTER_MODEL', 'anthropic/claude-sonnet-4')

    prompt = f"""You are an expert code reviewer. Review the following code file carefully.

Filename: {filename}

Return ONLY a valid JSON array. No explanation, no markdown, no preamble. Just the raw JSON array.

Each item in the array must have exactly these keys:
- \"line_number\": integer (the line number of the issue)
- \"severity\": one of \"error\", \"warning\", or \"suggestion\"
- \"comment\": a clear, helpful explanation of the issue

If the code has no issues, return an empty array: []

Code to review:
```{code_content}```

Return only the JSON array now:"""
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 2000,
            },
            timeout=30,
        )
        response.raise_for_status()
        raw = response.json()['choices'][0]['message']['content'].strip()
        # Strip possible markdown fences
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        raw = raw.strip()
        comments = json.loads(raw)
        # Validate structure
        valid = []
        for c in comments:
            if isinstance(c, dict) and {'line_number', 'severity', 'comment'}.issubset(c.keys()):
                if c['severity'] in ('error', 'warning', 'suggestion'):
                    valid.append(c)
        return valid
    except Exception as e:
        print(f"OpenRouter error for {filename}: {e}")
        return []
