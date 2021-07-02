// System
//// Material-UI
import { createMuiTheme } from '@material-ui/core/styles';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { grey, blueGrey, brown } from '@material-ui/core/colors';

// User

// Colors
// Material Design Color Tool: https://material.io/resources/color/#!/?view.left=0&view.right=0&primary.color=455A64&secondary.color=8D6E63&primary.text.color=FAFAFA&secondary.text.color=FAFAFA
const CustomColorPalette = {
    Primary: blueGrey[700],
    Secondary: brown[400],
    PrimaryText: grey[50],
    SecondaryText: grey[50],
    White: grey[50],
    Black: grey[900],
    LightGrey: grey[100],
    DarkGrey: grey[300],
    ExtraDarkGrey: grey[500]
};


// Customise Styles
const useStyles = makeStyles((theme) => ({
    // Root
    root: {
        flexGrow: 1
    },
    // Label
    label: {
        userSelect: 'none'
    },
    // Paper
    paper: {
        padding: theme.spacing( 2 ),
        color: CustomColorPalette.Black,
    },
    // AppBar
    appBar: {
        backgroundColor: CustomColorPalette.Primary,
        color: CustomColorPalette.PrimaryText
    },
    // ToolBar (inside AppBar) Has Button, etc.
    toolBar: {
        flexWrap: 'nowrap',
        alignItems: 'center'
    },
    // ToolBar Title
    toolBarTitle: {
        flexGrow: 1,
        marginLeft: theme.spacing( 2 ),
        userSelect: 'none'
    },
    // Dialog ToolBar Buttons
    dialogToolBarButton: {
        marginRight: theme.spacing( 2 )
    },
    // Dialog Content
    dialogContent: {
        marginTop: theme.spacing( 4 ),
        marginRight: theme.spacing( 4 ),
        marginBottom: theme.spacing( 4 ),
        marginLeft: theme.spacing( 4 )
    },
    // Heading
    subheading: {
        fontSize: theme.typography.pxToRem(13),
        fontWeight: theme.typography.fontWeightRegular,
        color: CustomColorPalette.Black,
        marginLeft: theme.spacing( 4 )
    },
    // Subheading
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
        color: CustomColorPalette.Black,
        marginLeft: theme.spacing( 3 )
    },
    // Chips Container
    chipsContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        listStyle: 'none',
        marginTop: theme.spacing( 2 ),
        marginRight: theme.spacing( 4 ),
        marginBottom: theme.spacing( 2 ),
        marginLeft: theme.spacing( 4 )
    },
    // Chip
    chip: {
        margin: theme.spacing(0.5)
    },
    // Text fields
    textfield: {
        width: '50vw'
    },
}));


export {
    CustomColorPalette,
    useStyles
};
