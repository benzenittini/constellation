
// -- Common components --

// Simple Components
import MappableLabel        from './components/MappableLabel.vue';
import TextBox              from './components/TextBox.vue';
import Checkbox             from './components/Checkbox.vue';
import RadioButton          from './components/RadioButton.vue';
import DateTime             from './components/DateTime.vue';
import Lightswitch          from './components/Lightswitch.vue';
import Dropdown             from './components/Dropdown.vue';
import InfoDisplay          from './components/InfoDisplay.vue';
import PossibleValueDisplay from './components/PossibleValueDisplay.vue';
import KeyboardKey          from './components/KeyboardKey.vue';
import MarkdownEditor       from './components/MarkdownEditor.vue';
import ExpandableTree       from './components/ExpandableTree.vue';
// Complex Widgets
import SaveCancel            from './components/SaveCancel.vue';
import SaveDontSaveCancel    from './components/SaveDontSaveCancel.vue';
import NextPrevious          from './components/NextPrevious.vue';
import Close                 from './components/Close.vue';
import ReleaseNoteDisplay    from './components/ReleaseNoteDisplay.vue';
import ReleaseNotesFormatted from './components/ReleaseNotesFormatted.vue';
import DynamicField          from './components/DynamicField.vue';
// Slide-Open Tray
import SlideOpenTray     from './components/SlideOpenTray.vue';
import ControlsContainer from './components/controls/ControlsContainer.vue';
import MindMapControls   from './components/controls/MindMapControls.vue';
import FilterControls    from './components/controls/FilterControls.vue';
import KanbanControls    from './components/controls/KanbanControls.vue';
// Simple SVG elements
import Arrow           from './svgs/Arrow.vue';
import Arrow2          from './svgs/Arrow2.vue';
import Calendar        from './svgs/Calendar.vue';
import Chainlink       from './svgs/Chainlink.vue';
import DeletionX       from './svgs/DeletionX.vue';
import DoubleArrow     from './svgs/DoubleArrow.vue';
import DragHandle      from './svgs/DragHandle.vue';
import EqualizeWidths  from './svgs/EqualizeWidths.vue';
import Filter          from './svgs/Filter.vue';
import Gear            from './svgs/Gear.vue';
import HierarchySymbol from './svgs/HierarchySymbol.vue';
import Hamburger       from './svgs/Hamburger.vue';
import Kanban          from './svgs/Kanban.vue';
import Lock            from './svgs/Lock.vue';
import MagnifyingGlass from './svgs/MagnifyingGlass.vue';
import Pencil          from './svgs/Pencil.vue';
import Person          from './svgs/Person.vue';
import Paper           from './svgs/Paper.vue';
import Plus            from './svgs/Plus.vue';
import QuestionMark    from './svgs/QuestionMark.vue';
import ResetArrow      from './svgs/ResetArrow.vue';
import StackBlocks     from './svgs/StackBlocks.vue';
import SpeechBubble    from './svgs/SpeechBubble.vue';
import Triangle        from './svgs/Triangle.vue';


// -- Pages --

// Project/Board List
import Projects from './pages/projects/_.vue';

// Mind Map
import Mindmap       from './pages/mindmap/_.vue';
import Canvas        from './pages/mindmap/Canvas.vue';
import Link          from './pages/mindmap/Link.vue';
import Block         from './pages/mindmap/Block.vue';
import BlockTray     from './pages/mindmap/BlockTray.vue';
import ExpandedBlock from './pages/mindmap/ExpandedBlock.vue';
import TextContent   from './pages/mindmap/TextContent.vue';
// Mind Map / Action Pane
import ActionPane                from './pages/mindmap/action-pane/_.vue';
import EditClassificationsDialog from './pages/mindmap/action-pane/EditClassificationsDialog.vue';
import EditFieldsDialog          from './pages/mindmap/action-pane/EditFieldsDialog.vue';
import FieldRow                  from './pages/mindmap/action-pane/FieldRow.vue';
import PossibleValuePane         from './pages/mindmap/action-pane/PossibleValuePane.vue';
import RecentColorPicker         from './pages/mindmap/action-pane/RecentColorPicker.vue';
import StyleEditor               from './pages/mindmap/action-pane/StyleEditor.vue';
import AlignmentControls         from './pages/mindmap/action-pane/AlignmentControls.vue';
// Mind Map / Titlebar
import Titlebar     from './pages/mindmap/titlebar/_.vue';
import Search       from './pages/mindmap/titlebar/Search.vue';
import BasicSearch  from './pages/mindmap/titlebar/BasicSearch.vue';
import ViewSelector from './pages/mindmap/titlebar/ViewSelector.vue';
// Mind Map / Views
import ViewContainer     from './pages/mindmap/views/ViewContainer.vue';
import FilterChainConfig from './pages/mindmap/views/FilterChainConfig.vue';
import KanbanContents    from './pages/mindmap/views/KanbanView/KanbanContents.vue';
import KanbanConfig      from './pages/mindmap/views/KanbanView/KanbanConfig.vue';
import FilterContents    from './pages/mindmap/views/FilterView/FilterContents.vue';
import FilterConfig      from './pages/mindmap/views/FilterView/FilterConfig.vue';


// -- The exported super-object --

export let components: any = {

    // -- Common Components --
    'eic-mappablelabel': MappableLabel,
    'eic-textbox': TextBox,
    'eic-markdowneditor': MarkdownEditor,
    'eic-checkbox': Checkbox,
    'eic-radiobutton': RadioButton,
    'eic-datetime': DateTime,
    'eic-lightswitch': Lightswitch,
    'eic-dropdown': Dropdown,
    'eic-infodisplay': InfoDisplay,
    'eic-possiblevaluedisplay': PossibleValueDisplay,
    'eic-expandable-tree': ExpandableTree,
    'eic-keyboard-key': KeyboardKey,
    'eic-close': Close,
    'eic-release-note-display': ReleaseNoteDisplay,
    'eic-release-notes-formatted': ReleaseNotesFormatted,
    'eic-dynamic-field': DynamicField,
    'eic-savecancel': SaveCancel,
    'eic-savedontsavecancel': SaveDontSaveCancel,
    'eic-nextprevious': NextPrevious,
    // Slide-Open Tray
    'eic-slide-open-tray': SlideOpenTray,
    'eic-controls-container': ControlsContainer,
    'eic-mind-map-controls': MindMapControls,
    'eic-filter-controls': FilterControls,
    'eic-kanban-controls': KanbanControls,
    // SVGs
    'eic-svg-arrow': Arrow,
    'eic-svg-arrow-2': Arrow2,
    'eic-svg-calendar': Calendar,
    'eic-svg-chainlink': Chainlink,
    'eic-svg-deletion-x': DeletionX,
    'eic-svg-doublearrow': DoubleArrow,
    'eic-svg-draghandle': DragHandle,
    'eic-svg-equalize-widths': EqualizeWidths,
    'eic-svg-filter': Filter,
    'eic-svg-gear': Gear,
    'eic-svg-hierarchy-symbol': HierarchySymbol,
    'eic-svg-hamburger': Hamburger,
    'eic-svg-kanban': Kanban,
    'eic-svg-lock': Lock,
    'eic-svg-magnifying-glass': MagnifyingGlass,
    'eic-svg-pencil': Pencil,
    'eic-svg-person': Person,
    'eic-svg-paper': Paper,
    'eic-svg-plus': Plus,
    'eic-svg-question-mark': QuestionMark,
    'eic-svg-reset-arrow': ResetArrow,
    'eic-svg-stack-blocks': StackBlocks,
    'eic-svg-speech-bubble': SpeechBubble,
    'eic-svg-triangle': Triangle,

    // -- Pages --
    // Project/Board List
    'eic-page-projects': Projects,
    // Mind Map
    'eic-page-mindmap': Mindmap,
    'eic-canvas': Canvas,
    'eic-link': Link,
    'eic-block': Block,
    'eic-block-tray': BlockTray,
    'eic-expanded-block': ExpandedBlock,
    'eic-text-content': TextContent,
    // Mind Map / Action Pane
    'eic-action-pane': ActionPane,
    'eic-edit-classifications-dialog': EditClassificationsDialog,
    'eic-edit-fields-dialog': EditFieldsDialog,
    'eic-field-row': FieldRow,
    'eic-possible-value-pane': PossibleValuePane,
    'eic-recent-color-picker': RecentColorPicker,
    'eic-style-editor': StyleEditor,
    'eic-alignment-controls': AlignmentControls,
    // Mind Map / Titlebar
    'eic-titlebar': Titlebar,
    'eic-search': Search,
    'eic-basic-search': BasicSearch,
    'eic-view-selector': ViewSelector,
    // Mind Map / Views
    'eic-view-container': ViewContainer,
    'eic-filter-chain-config': FilterChainConfig,
    'eic-kanban-contents': KanbanContents,
    'eic-kanban-config': KanbanConfig,
    'eic-filter-contents': FilterContents,
    'eic-filter-config': FilterConfig,
};
