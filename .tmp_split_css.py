"""One-off migration: split static/styles.css into shared base + admin.css + student.css."""
import re
from pathlib import Path

static = Path("StableRoomie/src/main/resources/static")
src = static / "styles.css"
text = src.read_text(encoding="utf-8")
lines = text.splitlines(keepends=True)


def take(a, b):
    """Inclusive 1-based line range."""
    return "".join(lines[a - 1:b])


# ---------------------------------------------------------------- admin rules
ADMIN_SECTIONS = [
    (188, 199),    # .classic-card (admin modal card)
    (406, 435),    # Admin lists
    (838, 891),    # Tables
    (934, 958),    # Search
    (959, 1005),   # Modal
    (1045, 1050),  # .results-list
    (1051, 1139),  # Matches / detail chips
    (1405, 1450),  # room-type-item … room-total-input
    (1451, 1484),  # room-type-results-block … unallotted-block
    (1491, 1497),  # .lock-actions
    (1498, 1587),  # Room Types management redesign
]

ADMIN_MEDIA_768_RANGE = (1235, 1261)
ADMIN_MEDIA_768 = take(*ADMIN_MEDIA_768_RANGE)
ADMIN_DARK_RANGES = [(1867, 1875), (1914, 1962)]
ADMIN_DARK = "".join(take(a, b) for a, b in ADMIN_DARK_RANGES)

# -------------------------------------------------------------- student rules
STUDENT_SECTIONS = [
    (733, 754),    # .preferences-form
    (1394, 1404),  # .locked-banner
]

STUDENT_MEDIA_768_RANGE = (1207, 1210)
STUDENT_MEDIA_768 = take(*STUDENT_MEDIA_768_RANGE)
STUDENT_DARK_RANGE = (1963, 1969)
STUDENT_DARK = take(*STUDENT_DARK_RANGE)

# ------------------------------------------------- rewrites of shared groups
# Line 1303-1310: one grouped 480px rule split three ways.
GROUPED_480 = (1303, 1310)
BASE_480 = (
    "  .glass-card,\n"
    "  .login-card,\n"
    "  .dashboard-card,\n"
    "  .feature-card {\n"
    "    padding: var(--space-md);\n"
    "  }\n"
)
ADMIN_480 = (
    "  .classic-card {\n"
    "    padding: var(--space-lg);\n"
    "  }\n"
    "\n"
    "  .modal-content,\n"
    "  .match-card {\n"
    "    padding: var(--space-md);\n"
    "  }\n"
)
STUDENT_480 = (
    "  .preferences-form {\n"
    "    padding: var(--space-md);\n"
    "  }\n"
)

# Line 1908-1912: grouped dark hover override split by owner.
GROUPED_DARK_HOVER = (1908, 1912)
BASE_DARK_HOVER = (
    "/* Sidebar close hover */\n"
    ".sidebar-close-btn:hover {\n"
    "  background: var(--color-surface-hover);\n"
    "}\n"
)
ADMIN_DARK_HOVER = (
    "/* Modal close hover */\n"
    ".modal-close:hover {\n"
    "  background: var(--color-surface-hover);\n"
    "}\n"
)


def rebuild(operations, keep):
    """operations: {start_line: (end_line, replacement_text_or_None)}."""
    out = []
    i = 1
    total = len(lines)
    while i <= total:
        op = operations.get(i)
        if op:
            end, replacement = op
            if replacement is not None:
                out.append(replacement)
            i = end + 1
            continue
        out.append(lines[i - 1])
        i += 1
    body = "".join(out)
    body = re.sub(r"\n{4,}", "\n\n\n", body)
    return body.rstrip("\n") + "\n"


# ------------------------------------------------------------------ base file
base_ops = {}
for a, b in (
    ADMIN_SECTIONS
    + STUDENT_SECTIONS
    + [ADMIN_MEDIA_768_RANGE, STUDENT_MEDIA_768_RANGE, STUDENT_DARK_RANGE]
    + ADMIN_DARK_RANGES
):
    base_ops[a] = (b, None)
base_ops[GROUPED_480[0]] = (GROUPED_480[1], BASE_480)
# .classic-card / .modal-content 480px rules are re-emitted in admin.css
base_ops[1312] = (1318, None)
base_ops[GROUPED_DARK_HOVER[0]] = (GROUPED_DARK_HOVER[1], BASE_DARK_HOVER)

base_out = rebuild(base_ops, keep=True)

# ----------------------------------------------------------------- admin file
admin_body = "".join(take(a, b) for a, b in ADMIN_SECTIONS).strip("\n")
admin_out = (
    "/* ============================================\n"
    "   StableRoomie — Admin (warden) screen styles\n"
    "   Loaded after styles.css on the admin dashboard only.\n"
    "   ============================================ */\n"
    "\n"
    f"{admin_body}\n"
    "\n"
    "/* ── Responsive: Mobile (≤ 768px) ──────────── */\n"
    "@media (max-width: 768px) {\n"
    f"{ADMIN_MEDIA_768}"
    "}\n"
    "\n"
    "/* ── Responsive: Small phones (≤ 480px) ────── */\n"
    "@media (max-width: 480px) {\n"
    f"{ADMIN_480}"
    "}\n"
    "\n"
    "/* ================================================================== */\n"
    "/* Velvet Dark Theme — admin components                                */\n"
    "/* ================================================================== */\n"
    "\n"
    f"{ADMIN_DARK.rstrip(chr(10))}\n"
    "\n"
    f"{ADMIN_DARK_HOVER}"
).replace("\n\n\n\n", "\n\n\n")

# --------------------------------------------------------------- student file
student_body = "".join(take(a, b) for a, b in STUDENT_SECTIONS).strip("\n")
student_out = (
    "/* ============================================\n"
    "   StableRoomie — Student screen styles\n"
    "   Loaded after styles.css on the student dashboard only.\n"
    "   ============================================ */\n"
    "\n"
    f"{student_body}\n"
    "\n"
    "/* ── Responsive: Mobile (≤ 768px) ──────────── */\n"
    "@media (max-width: 768px) {\n"
    f"{STUDENT_MEDIA_768}"
    "}\n"
    "\n"
    "/* ── Responsive: Small phones (≤ 480px) ────── */\n"
    "@media (max-width: 480px) {\n"
    f"{STUDENT_480}"
    "}\n"
    "\n"
    "/* ── Velvet Dark Theme — student components ── */\n"
    f"{STUDENT_DARK}"
)


# ------------------------------------------------------------------ utilities
def selectors(css):
    """Multiset of individual selectors, including those inside @media blocks."""
    css = re.sub(r"/\*.*?\*/", " ", css, flags=re.S)
    found = []
    depth = 0
    in_media = False
    prelude = ""
    for ch in css:
        if ch == "{":
            text_prelude = " ".join(prelude.split())
            if text_prelude.startswith("@"):
                if depth == 0:
                    in_media = True
            elif depth == 0 or (depth == 1 and in_media):
                for sel in text_prelude.split(","):
                    if sel.strip():
                        found.append(sel.strip())
            depth += 1
            prelude = ""
        elif ch == "}":
            depth = max(0, depth - 1)
            if depth == 0:
                in_media = False
            prelude = ""
        else:
            prelude += ch
    return found


def braces(css):
    stripped = re.sub(r"/\*.*?\*/", " ", css, flags=re.S)
    return stripped.count("{"), stripped.count("}")


for name, css in (("styles.css", base_out), ("admin.css", admin_out), ("student.css", student_out)):
    o, c = braces(css)
    print(f"{name}: lines={len(css.splitlines())} braces {o}/{c} {'OK' if o == c else 'MISMATCH'}")

from collections import Counter

before = Counter(selectors(text))
after = Counter(selectors(base_out) + selectors(admin_out) + selectors(student_out))
missing = before - after
extra = after - before
print(f"\nselectors before={sum(before.values())} after={sum(after.values())}")
print("missing:", dict(missing))
print("extra:", dict(extra))

if missing or extra:
    raise SystemExit("REFUSING TO WRITE: selector mismatch")

(static / "styles.css").write_text(base_out, encoding="utf-8")
(static / "admin.css").write_text(admin_out, encoding="utf-8")
(static / "student.css").write_text(student_out, encoding="utf-8")
print("\nwrote styles.css, admin.css, student.css")
