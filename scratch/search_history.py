import os
import json
import re

brain_dir = r"C:\Users\rycha\.gemini\antigravity\brain"
current_conv = "564f8ea1-18f6-40f6-84b5-e06b24e67b9c"

keywords = ["vender", "preço", "preco", "valor", "comercializar", "modulo", "módulo", "licença", "licenca", "custo"]

for root, dirs, files in os.walk(brain_dir):
    if current_conv in root:
        continue
    for file in files:
        if file == "transcript.jsonl":
            file_path = os.path.join(root, file)
            conv_id = os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(file_path))))
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    for line_num, line in enumerate(f, 1):
                        # Simple search before JSON parsing to be fast
                        if any(kw in line.lower() for kw in keywords):
                            try:
                                data = json.loads(line)
                                content = data.get("content", "")
                                # Check if it's user input or model output
                                if data.get("type") in ["USER_INPUT", "PLANNER_RESPONSE", "VIEW_FILE", "RUN_COMMAND"]:
                                    # Let's filter to actual discussion text rather than command outputs or tool parameters
                                    if len(content) > 10 and not content.startswith("{") and not "Diretório" in content:
                                        print(f"[{conv_id}][L{line_num}][{data.get('type')}]:")
                                        # Print snippets around keywords
                                        print(content[:300] + "...")
                                        print("-" * 50)
                            except Exception:
                                pass
            except Exception as e:
                pass
