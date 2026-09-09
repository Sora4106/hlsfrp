"""Create web-ready WebP assets while preserving the legacy originals."""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public" / "assets" / "legacy"
OUTPUT_DIR = ROOT / "public" / "assets" / "optimized"
SUPPORTED = {".jpg", ".jpeg", ".png"}
FULL_MAX_SIZE = (1920, 1920)
CARD_MAX_SIZE = (720, 720)

# Logos and specification drawings need crisp edges and text.
LOSSLESS_FILES = {
    "11_n090.jpg",
    "7an8.png",
    "c5su.png",
    "c8xs.png",
    "eld9.png",
    "yxb9.png",
}


def prepare(image: Image.Image, max_size: tuple[int, int]) -> Image.Image:
    image = ImageOps.exif_transpose(image)
    image.thumbnail(max_size, Image.Resampling.LANCZOS)
    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGBA" if "transparency" in image.info else "RGB")
    return image


def save_webp(image: Image.Image, destination: Path, lossless: bool, quality: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(
        destination,
        "WEBP",
        quality=quality,
        method=6,
        lossless=lossless,
        exact=lossless,
    )


def main() -> None:
    source_bytes = 0
    optimized_bytes = 0
    image_count = 0

    for source in sorted(SOURCE_DIR.iterdir()):
        if source.suffix.lower() not in SUPPORTED:
            continue

        image_count += 1
        source_bytes += source.stat().st_size
        lossless = source.name in LOSSLESS_FILES

        with Image.open(source) as original:
            full = prepare(original.copy(), FULL_MAX_SIZE)
            card = prepare(original.copy(), CARD_MAX_SIZE)

        full_path = OUTPUT_DIR / f"{source.stem}.webp"
        card_path = OUTPUT_DIR / f"{source.stem}-card.webp"
        save_webp(full, full_path, lossless=lossless, quality=82)
        save_webp(card, card_path, lossless=lossless, quality=76)
        optimized_bytes += full_path.stat().st_size + card_path.stat().st_size

    print(f"Optimized {image_count} images")
    print(f"Legacy originals: {source_bytes / 1024 / 1024:.2f} MB")
    print(f"WebP full + card variants: {optimized_bytes / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    main()
