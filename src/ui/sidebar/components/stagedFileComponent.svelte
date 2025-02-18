<script lang="ts">
    import { setIcon, TFile } from "obsidian";
    import { hoverPreview } from "obsidian-community-lib";
    import { DIFF_VIEW_CONFIG } from "src/constants";
    import { GitManager } from "src/gitManager";
    import { FileStatusResult } from "src/types";
    import { getNewLeaf } from "src/utils";
    import GitView from "../sidebarView";

    export let change: FileStatusResult;
    export let view: GitView;
    export let manager: GitManager;
    let buttons: HTMLElement[] = [];
    $: formattedPath = change.vault_path;
    $: side = (view.leaf.getRoot() as any).side == "left" ? "right" : "left";

    window.setTimeout(
        () => buttons.forEach((b) => setIcon(b, b.getAttr("data-icon")!, 16)),
        0
    );

    function hover(event: MouseEvent) {
        //Don't show previews of config- or hidden files.
        if (
            !change.path.startsWith(view.app.vault.configDir) ||
            !change.path.startsWith(".")
        ) {
            hoverPreview(
                event,
                view as any,
                formattedPath.split("/").last()!.replace(".md", "")
            );
        }
    }

    function open(event: MouseEvent) {
        const file = view.app.vault.getAbstractFileByPath(change.vault_path);
        if (file instanceof TFile) {
            getNewLeaf(event)?.openFile(file);
        }
    }

    function showDiff(event: MouseEvent) {
        getNewLeaf(event)?.setViewState({
            type: DIFF_VIEW_CONFIG.type,
            active: true,
            state: {
                file: change.path,
                staged: true,
            },
        });
    }

    function unstage() {
        manager.unstage(change.path, false).finally(() => {
            dispatchEvent(new CustomEvent("git-refresh"));
        });
    }
</script>

<main on:mouseover={hover} on:focus on:click|self={showDiff} class="nav-file">
    <!-- svelte-ignore a11y-unknown-aria-attribute -->
    <div
        class="nav-file-title"
        aria-label-position={side}
        aria-label={formattedPath.split("/").last() != formattedPath
            ? formattedPath
            : ""}
        on:click|self={showDiff}
    >
        <div
            on:click={showDiff}
            on:auxclick={showDiff}
            class="nav-file-title-content"
        >
            {formattedPath.split("/").last()?.replace(".md", "")}
        </div>
        <div class="tools">
            <div class="buttons">
                {#if view.app.vault.getAbstractFileByPath(formattedPath)}
                    <div
                        data-icon="go-to-file"
                        aria-label="Open File"
                        bind:this={buttons[1]}
                        on:click={open}
                        class="clickable-icon"
                    />
                {/if}
                <div
                    data-icon="minus"
                    aria-label="Unstage"
                    bind:this={buttons[0]}
                    on:click={unstage}
                    class="clickable-icon"
                />
            </div>
            <div class="type" data-type={change.index}>{change.index}</div>
        </div>
    </div>
</main>

<style lang="scss">
    main {
        .nav-file-title-content {
            display: flex;
            align-items: center;
        }
        .tools {
            display: flex;
            margin-left: auto;
            .type {
                padding-left: var(--size-2-1);
                width: 11px;
                display: flex;
                align-items: center;
                justify-content: center;
                &[data-type="M"] {
                    color: orange;
                }
                &[data-type="D"] {
                    color: red;
                }
            }
            .buttons {
                display: flex;
                > * {
                    padding: 0 0;
                    height: auto;
                }
            }
        }
    }
</style>
