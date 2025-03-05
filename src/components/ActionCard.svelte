<script>
    export let elevation = 1
</script>

<div class="action-card elevation-{elevation}">
    <div class="content">
        <slot name="header" />
        <slot name="body" />
    </div>
</div>

<style>
    .action-card {
        border-radius: 8px;
        font-size: var(--font-size-xsmall);
        font-weight: var(--font-weight-normal);
        color: var(--figma-color-text);
        line-height: var(--font-line-height) !important;
        width: 100%;
    }

    .content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .elevation-0 {
        background-color: var(--figma-color-bg);
        box-shadow: none;
    }

    .elevation-1 {
        border: 1px solid var(--figma-color-border);
        background-color: var(--figma-color-bg-secondary);
        box-shadow: 0px 4px 8px #00000011;
    }

    :global(.action-card p:not(:only-child):not(:first-child)) {
        margin-top: 8px;
    }

    :global(.action-card p:not(:last-child)) {
        margin-bottom: 8px;
    }
</style>
