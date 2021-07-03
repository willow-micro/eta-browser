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
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
        color: CustomColorPalette.Black,
        marginLeft: theme.spacing( 3 ),
        userSelect: 'none'
    },
    // Subheading
    subheading: {
        fontSize: theme.typography.pxToRem(13),
        fontWeight: theme.typography.fontWeightRegular,
        color: CustomColorPalette.Black,
        marginLeft: theme.spacing( 4 ),
        userSelect: 'none'
    },
    // Subheading with an icon
    wrapIconSubheading: {
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: theme.typography.pxToRem(13),
        fontWeight: theme.typography.fontWeightRegular,
        color: CustomColorPalette.Black,
        marginLeft: theme.spacing( 4 ),
        userSelect: 'none'
    },
    // Inline Help Icon
    helpIcon: {
        display: 'inline',
        color: CustomColorPalette.ExtraDarkGrey,
    },
    // Chips Container
    chipsContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        listStyle: 'none',
        marginTop: theme.spacing( 0 ),
        marginRight: theme.spacing( 4 ),
        marginBottom: theme.spacing( 0 ),
        marginLeft: theme.spacing( 4 )
    },
    // Chip
    chip: {
        marginTop: theme.spacing( 1 ),
        marginRight: theme.spacing( 1 ),
        marginBottom: theme.spacing( 0 ),
        marginLeft: theme.spacing( 0 )
    },
    // Add Chip Controls Container
    newChipContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'baseline',
        flexWrap: 'none',
        marginTop: theme.spacing( 0 ),
        marginRight: theme.spacing( 6 ),
        marginBottom: theme.spacing( 0 ),
        marginLeft: theme.spacing( 2 )
    },
    // Add Chip text fields
    newChipTextfield: {
        width: '20vw'
    },
    // Add Chip Button
    newChipButton: {
        marginLeft: theme.spacing( 2 )
    },
    // Slider Container
    sliderContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'none',
        marginTop: theme.spacing( 6 ),
        marginRight: theme.spacing( 6 ),
        marginBottom: theme.spacing( 4 ),
        marginLeft: theme.spacing( 6 )
    },
    // Slider
    slider: {
        marginTop: theme.spacing( 0 ),
        marginRight: theme.spacing( 4 ),
        marginBottom: theme.spacing( 0 ),
        marginLeft: theme.spacing( 4 )
    }
}));


export {
    CustomColorPalette,
    useStyles
};
