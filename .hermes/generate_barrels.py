#!/usr/bin/env python3
"""Generate index.ts barrel exports for all admin modules."""
import os, re

BASE = "/Users/BAWES/Sites/studenthub/studenthub-next-coder2/src/modules/admin"
MODULES = [
    "attendance", "aws", "bank", "blocked-ips", "candidate-education",
    "candidates", "companies", "compliance", "currency", "dashboard",
    "designations", "employees", "evaluations", "event", "invoices",
    "jira", "note", "payments", "permissions", "reports", "requests",
    "stores", "tags", "tickets", "transfers", "xero",
]

def extract_exports(source, pattern):
    """Extract named exports from source code matching a regex pattern."""
    matches = []
    for m in re.finditer(pattern, source, re.MULTILINE):
        name = m.group(1)
        if name and name not in matches:
            matches.append(name)
    return matches

def generate_index(module_name):
    """Generate index.ts content for a given admin module."""
    actions_path = os.path.join(BASE, module_name, "actions.ts")
    schemas_path = os.path.join(BASE, module_name, "schemas.ts")
    
    if not os.path.exists(actions_path) or not os.path.exists(schemas_path):
        return None
    
    with open(actions_path) as f:
        actions_src = f.read()
    with open(schemas_path) as f:
        schemas_src = f.read()
    
    # Extract action function names
    # Patterns: "export async function funcName" or "export function funcName"
    action_funcs = extract_exports(actions_src, r'export\s+(?:async\s+)?function\s+([a-zA-Z_]\w*)\s*\(')
    
    # Extract type names
    # Patterns: "export type TypeName" - exclude Schema types
    type_names = extract_exports(schemas_src, r'export\s+type\s+([a-zA-Z_]\w*)\s*[=;<]')
    # Also catch: "export type { X } from ..." which won't have = or <
    for m in re.finditer(r'export\s+type\s+{?\s*([a-zA-Z_]\w*)\s*}?\s*[=;<>]', schemas_src):
        name = m.group(1)
        if name and name not in type_names and not name.endswith("Schema") and not name.endswith("Response") and not name.endswith("Input"):
            type_names.append(name)
    
    # Extract schema const names
    schema_names = extract_exports(schemas_src, r'export\s+(?:const|function)\s+([a-zA-Z_]\w*(?:Schema|Response)[a-zA-Z_]*)\s*[=:(]')
    # Also catch schema names that don't end with Schema/Response
    for m in re.finditer(r'export\s+const\s+([a-zA-Z_]\w*)\s*[=:]', schemas_src):
        name = m.group(1)
        if name and name not in schema_names:
            schema_names.append(name)
    
    # Build content
    lines = []
    lines.append("// ---------------------------------------------------------------------------")
    lines.append(f"// Admin {module_name.capitalize()} - barrel exports")
    lines.append("// ---------------------------------------------------------------------------")
    lines.append("")
    
    if action_funcs:
        lines.append("export {")
        for fn in action_funcs:
            lines.append(f"  {fn},")
        lines.append("} from \"./actions\";")
        lines.append("")
    
    if type_names:
        lines.append("export type {")
        for tn in type_names:
            lines.append(f"  {tn},")
        lines.append("} from \"./schemas\";")
        lines.append("")
    
    if schema_names:
        lines.append("export {")
        for sn in schema_names:
            lines.append(f"  {sn},")
        lines.append("} from \"./schemas\";")
    
    return "\n".join(lines) + "\n"

# Generate and write all
written = []
errors = []
for mod in MODULES:
    content = generate_index(mod)
    if content:
        out_path = os.path.join(BASE, mod, "index.ts")
        with open(out_path, "w") as f:
            f.write(content)
        written.append(mod)
        print(f"OK {mod} ({len(content)} chars)")
    else:
        errors.append(mod)
        print(f"SKIP {mod} - missing actions.ts or schemas.ts")

print(f"\nTotal written: {len(written)}/{len(MODULES)}")
if errors:
    print(f"Errors: {', '.join(errors)}")
