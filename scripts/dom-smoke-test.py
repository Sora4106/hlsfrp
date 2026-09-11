"""Run the browser smoke-test page in Chrome and verify its final status."""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BROWSER_CANDIDATES = (
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
)
PORT = 4175
TEST_URL = f"http://127.0.0.1:{PORT}/scripts/dom-smoke-runner.html"


def main() -> int:
    browser = next((candidate for candidate in BROWSER_CANDIDATES if candidate.exists()), None)
    if browser is None:
        raise RuntimeError("Chrome or Microsoft Edge was not found.")

    profile_root = ROOT / "research" / "verification"
    profile_root.mkdir(parents=True, exist_ok=True)
    profile = tempfile.mkdtemp(prefix="hlsfrp-smoke-", dir=profile_root)
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        time.sleep(1)
        result = subprocess.run(
            [
                str(browser),
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--no-first-run",
                f"--user-data-dir={profile}",
                "--virtual-time-budget=12000",
                "--dump-dom",
                TEST_URL,
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=25,
        )
        output = result.stdout
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or f"Chrome exited with {result.returncode}")
        if 'data-status="pass"' not in output:
            marker = output.find('id="result"')
            excerpt = output[marker : marker + 1800] if marker >= 0 else output[-1800:]
            raise AssertionError(f"Browser smoke tests failed:\n{excerpt}")
        print("DOM smoke tests passed: language, product, lightbox, contact, visitor and welcome behavior.")
        return 0
    finally:
        server.terminate()
        try:
            server.wait(timeout=3)
        except subprocess.TimeoutExpired:
            server.kill()
        shutil.rmtree(profile, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
