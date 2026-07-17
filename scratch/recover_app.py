import sys

app_path = r"d:\ERP Venner\frontend\app.js"

with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

bind_shell_new = """function bindShellEvents() {
    const container = document.getElementById('sidebar-container');
    if (!container || container.dataset.bound === 'true') return;

    container.dataset.bound = 'true';
    container.addEventListener('click', (event) => handleMenuInteraction(event));
    container.addEventListener('pointerenter', (event) => handleMenuPrefetch(event), true);
    container.addEventListener('focusin', (event) => handleMenuPrefetch(event));
    container.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        handleMenuInteraction(event);
    });
}"""

# Since the replacement happened twice (one for bind_shell, one for renderSidebar),
# the file might have been messed up. 
# But wait, the second replace was old_render_block. 
# Did old_render_block work? 
# If the file was 12MB, old_render_block probably didn't find "const FEATURE_GROUP_LABELS" because it was fragmented by bind_shell_new!

# Let's remove all occurrences of bind_shell_new EXCEPT the one that is supposed to be there.
# Wait, if we just split by bind_shell_new and join, we get the original file back!
# But the original file HAD bind_shell_old. By joining with "", we get the file with bind_shell_old restored?
# Wait! If it inserted bind_shell_new at every empty string match, then the original text is preserved in the split fragments.
# Let's try splitting by bind_shell_new and joining.

parts = content.split(bind_shell_new)
recovered = "".join(parts)

# Let's check if the recovered file starts with "// ERP VENNER - SHELL ORCHESTRATOR"
print(recovered[:100])
print(f"Recovered size: {len(recovered)}")

with open(r"d:\ERP Venner\scratch\app_recovered.js", 'w', encoding='utf-8') as f:
    f.write(recovered)
