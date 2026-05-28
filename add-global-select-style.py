# Run this from your project root.
# It adds a global Yoryantra select style to app/globals.css.
# It does not edit individual tool files.

from pathlib import Path

globals_path = Path("app/globals.css")

if not globals_path.exists():
    raise SystemExit("app/globals.css not found. Run this from your project root.")

css_block = """

/* Yoryantra global select styling */
select {
  background-color: #ffffff;
  color: var(--dark);
  border-color: #d1d5db;
}

select:hover {
  border-color: var(--green);
}

select:focus {
  border-color: var(--green);
  outline: none;
}

select option {
  background-color: #ffffff;
  color: var(--dark);
}
"""

text = globals_path.read_text(encoding="utf-8")

if "/* Yoryantra global select styling */" in text:
    print("Global select styling already exists. No duplicate added.")
else:
    globals_path.write_text(text.rstrip() + css_block + "\n", encoding="utf-8")
    print("Global select styling added to app/globals.css successfully.")
