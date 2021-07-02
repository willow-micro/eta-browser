// System
//// Material-UI
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
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

// Material-UI Custom Theme Application
// Default values: https://material-ui.com/customization/default-theme/
const CustomTheme = createMuiTheme( {
    // theme.spacing
    spacing: 8,                 // Default: 8px
    // Color Schemes
    palette: {
        primary: {
            main: CustomColorPalette.Primary,
            contrastText: CustomColorPalette.PrimaryText,
        },
        secondary: {
            main: CustomColorPalette.Secondary,
            contrastText: CustomColorPalette.SecondaryText,
        },
    },
    // Font
    typography: {
        // Global font family
        fontFamily: [
            'Roboto',
            'Noto Sans JP',
            'sans-serif',
        ].join( ',' ),
        // Font size (whole html)
        // htmlFontSize effects rem, so keep it default
        htmlFontSize: 16,       // Default: 16px
    },
    // Overwrite Material-UI Styles
    overrides: {
        // Typography
        typography: {
            color: 'inherit',
            variantMapping: {
                h1: 'h2',
                h2: 'h2',
                h3: 'h2',
                h4: 'h2',
                h5: 'h2',
                h6: 'h2',
                subtitle1: 'h2',
                subtitle2: 'h2',
                body1: 'span',
                body2: 'span',
            },
        },
        // TextField
        MuiTextField: {
            root: {
                // Avoid size reduction when specify min and max at InputProps
                width: '100%'
            }
        }
    }
} );

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
    // Paper
    paper: {
        padding: theme.spacing( 2 ),
        color: CustomColorPalette.Black,
    },
    // Heading
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
        color: CustomColorPalette.Black,
        marginLeft: theme.spacing( 3 )
    },
    // Setup Accordion Details
    setupAccordionDetails: {
        display: 'block',
        paddingTop: theme.spacing( 0 ),
        paddingRight: theme.spacing( 2 ),
        paddingBottom: theme.spacing( 0 ),
        paddingLeft: theme.spacing( 2 )
    },
    // Setup Accordion Actions
    setupAccordionActions: {
        display: 'flex',
        justifyContent: 'center',
        padding: theme.spacing( 2 )
    },
    // Text fields
    textfield: {
        width: '50vw'
    },
    // Destination Path Selector Container
    pathSelector: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    // Destination Path
    destinationPath: {
        marginRight: theme.spacing( 2 ),
        color: CustomColorPalette.Black,
        textAlign: 'right'
    },
    // Debug Table: Icon Margin
    debugTableIcon: {
        marginRight: theme.spacing( 3 ),
        marginLeft: theme.spacing( 3 ),
        verticalAlign: 'sub'
    }
}));


export {
    CustomColorPalette,
    CustomTheme,
    useStyles
};
