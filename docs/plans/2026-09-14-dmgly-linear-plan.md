# Dmgly — Linear delivery plan

Project: [Dmgly](https://linear.app/remocn/project/dmgly-8ec94346a7b0)  
Team: Remocn  
Specification: [MVP product and design specification](https://linear.app/remocn/document/dmgly-mvp-product-and-design-specification-e1405119a9aa)

Created 18 MVP issues across four milestones and one deferred branding issue. All issues start in Backlog, with no assignees or deadlines. Dependencies are set in Linear. This is the creation snapshot; Linear is the source of current execution status.

| Issue | Scope | Milestone | Blocked by |
| --- | --- | --- | --- |
| [REM-414](https://linear.app/remocn/issue/REM-414/validate-packaging-capabilities-and-define-the-dmg-export-contract) | Validate packaging capabilities and define the DMG export contract | Foundations | — |
| [REM-415](https://linear.app/remocn/issue/REM-415/validate-dialkit-controls-with-canvas-updates-and-shared-undo-state) | Validate DialKit controls with canvas updates and shared undo state | Foundations | — |
| [REM-416](https://linear.app/remocn/issue/REM-416/implement-the-shared-composition-model-and-editor-actions) | Implement the shared composition model and editor actions | Foundations | REM-414 |
| [REM-417](https://linear.app/remocn/issue/REM-417/build-the-light-dmgly-homepage-and-editor-layout) | Build the light Dmgly homepage and editor layout | Foundations | — |
| [REM-418](https://linear.app/remocn/issue/REM-418/implement-the-finder-preview-with-selection-dragging-and-alignment) | Implement the Finder preview with selection, dragging, and alignment guides | Visual editor | REM-416, REM-417 |
| [REM-419](https://linear.app/remocn/issue/REM-419/add-solid-and-editable-linearradial-gradient-backgrounds) | Add solid and editable linear/radial gradient backgrounds | Visual editor | REM-416, REM-418 |
| [REM-420](https://linear.app/remocn/issue/REM-420/add-app-icon-and-background-image-uploads-with-framing-controls) | Add app-icon and background-image uploads with framing controls | Visual editor | REM-416, REM-418 |
| [REM-421](https://linear.app/remocn/issue/REM-421/add-editable-text-and-arrow-with-independent-visibility-toggles) | Add editable text and arrow with independent visibility toggles | Visual editor | REM-416, REM-418 |
| [REM-422](https://linear.app/remocn/issue/REM-422/integrate-the-contextual-properties-panel-using-dialkit-controls) | Integrate the contextual properties panel using DialKit controls | Visual editor | REM-415, REM-419, REM-420, REM-421 |
| [REM-423](https://linear.app/remocn/issue/REM-423/implement-unified-undo-and-redo-for-composition-edits) | Implement unified undo and redo for composition edits | Visual editor | REM-422 |
| [REM-424](https://linear.app/remocn/issue/REM-424/persist-and-restore-local-drafts-including-uploaded-assets) | Persist and restore local drafts including uploaded assets | Visual editor | REM-422 |
| [REM-425](https://linear.app/remocn/issue/REM-425/render-export-ready-dmg-backgrounds-from-the-composition) | Render export-ready DMG backgrounds from the composition | Export and AI handoff | REM-419, REM-420, REM-421, REM-414 |
| [REM-426](https://linear.app/remocn/issue/REM-426/generate-electron-builder-dmg-configuration-and-setup-instructions) | Generate electron-builder DMG configuration and setup instructions | Export and AI handoff | REM-425 |
| [REM-427](https://linear.app/remocn/issue/REM-427/generate-tauri-dmg-configuration-and-setup-instructions) | Generate Tauri DMG configuration and setup instructions | Export and AI handoff | REM-425 |
| [REM-428](https://linear.app/remocn/issue/REM-428/generate-a-create-dmg-packaging-script-for-native-macos-apps) | Generate a create-dmg packaging script for native macOS apps | Export and AI handoff | REM-425 |
| [REM-429](https://linear.app/remocn/issue/REM-429/generate-english-ai-setup-prompts-for-all-packaging-targets) | Generate English AI setup prompts for all packaging targets | Export and AI handoff | REM-426, REM-427, REM-428 |
| [REM-430](https://linear.app/remocn/issue/REM-430/build-the-export-dialog-with-config-ai-prompt-and-zip-download) | Build the export dialog with config, AI prompt, and ZIP download | Export and AI handoff | REM-429 |
| [REM-431](https://linear.app/remocn/issue/REM-431/verify-the-complete-mvp-across-browsers-and-real-macos-dmg-builds) | Verify the complete MVP across browsers and real macOS DMG builds | MVP verification | REM-430, REM-423, REM-424 |
| [REM-432](https://linear.app/remocn/issue/REM-432/revisit-the-dmgly-logo-direction-after-the-editor-is-established) | Revisit the Dmgly logo direction after the editor is established | Deferred | — |

