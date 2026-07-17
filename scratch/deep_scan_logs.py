import os
import json

brain_dir = r"C:\Users\rycha\.gemini\antigravity\brain"

# We want to find any conversation where pricing, selling, or costing of modules was discussed.
keywords = ["vender", "preço", "preco", "valor", "modulo", "módulo", "licença", "licenca", "custar", "cobrar", "venda"]

for root, dirs, files in os.walk(brain_dir):
    for file in files:
        if file == "transcript.jsonl":
            file_path = os.path.join(root, file)
            conv_id = os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(file_path))))
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    for line_num, line in enumerate(f, 1):
                        line_lower = line.lower()
                        # If a line contains "modulo" or "módulo" and one of the selling/pricing keywords
                        if ("modulo" in line_lower or "módulo" in line_lower) and any(kw in line_lower for kw in ["vender", "preço", "preco", "valor", "comercial", "licen", "custo", "assina"]):
                            try:
                                data = json.loads(line)
                                if data.get("type") in ["USER_INPUT", "PLANNER_RESPONSE"]:
                                    print(f"[{conv_id}][{data.get('type')}][L{line_num}]:")
                                    print(data.get("content"))
                                    print("=" * 80)
                            except Exception:
                                pass
            except Exception:
                pass
