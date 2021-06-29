// System
import React, { useState, useEffect } from 'react';
//// Material-UI
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AppBar, Toolbar, Grid, Paper, Typography, List, ListSubheader, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Divider } from '@material-ui/core';
import { ButtonGroup, Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { grey, blueGrey, brown } from '@material-ui/core/colors';
import WebIcon from '@material-ui/icons/Web';
import CodeIcon from '@material-ui/icons/Code';
import LabelIcon from '@material-ui/icons/Label';
import CropFreeIcon from '@material-ui/icons/CropFree';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';

// User

// Colors
const SystemColor = {
    Primary: blueGrey[500],
    Secondary: brown[500],
    PrimaryText: grey[50],
    SecondaryText: grey[50],
    White: grey[50],
    Black: grey[900],
    LightGrey: grey[100],
    DarkGrey: grey[300],
    ExtraDarkGrey: grey[500],
};

// Material-UI Custom Theme Application
// Default values: https://material-ui.com/customization/default-theme/
const customTheme = createMuiTheme( {
    // Spacingの設定
    spacing: 8,                 // デフォルト値: 8px
    // カラースキームの設定
    palette: {
        // プライマリ
        primary: {
            main: SystemColor.Primary,
            contrastText: SystemColor.PrimaryText,
        },
        // セカンダリ
        secondary: {
            main: SystemColor.Secondary,
            contrastText: SystemColor.SecondaryText,
        },
    },
    // フォントの設定
    typography: {
        // すべてのフォントファミリーの変更
        fontFamily: [
            'Roboto',
            'Noto Sans JP',
            'sans-serif',
        ].join( ',' ),
        // フォントサイズの変更
        // htmlFontSizeを変更すると, rem (root em)で指定したフォントサイズが影響を受ける．
        // よってTypographyの各variantのフォントサイズも変化してしまうため，これは変更していない
        htmlFontSize: 16,       // デフォルト値: 16px
    },
    // Material-UIのコンポーネントのデフォルトスタイルの上書き
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
                // InputPropsにminおよびmaxを指定した際，その値に応じて親要素より小さくなってしまう現象を防ぐ
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
        backgroundColor: SystemColor.Primary,
        color: SystemColor.PrimaryText
    },
    // ToolBar (inside AppBar) Has Button, etc.
    toolBar: {
        flexWrap: 'nowrap',
        alignItems: 'center'
    },
    // ToolBar Title
    toolBarTitle: {
        marginLeft: theme.spacing( 2 ),
        userSelect: 'none'
    },
    // Paper
    paper: {
        padding: theme.spacing( 2 ),
        color: SystemColor.Black,
    },
    // Text fields
    textfield: {
        width: '50vw'
    },
    // Button Group div
    buttonGroupContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing( 2 )
    },
    // Debug List: Right Field
    debugListItemSecondaryAction: {
        paddingRight: theme.spacing( 2 )
    }
}));


// Main Component
const MainView = () => {
    // useState
    const [buttonState, setButtonState] = useState(0);

    const [appMessage, setAppMessage] = useState("起動しました");
    const [appMessageType, setAppMessageType] = useState("success");
    const [browserURL, setBrowserURL] = useState("file:///Users/kawa/Wakayama/2021/HCDLab/sample/eta-sample-menu/build/index.html");
    const [isBrowserURLValid, setIsBrowserURLValid] = useState(true);

    const [domCoordinateX, setDomCoordinateX] = useState(0);
    const [domCoordinateY, setDomCoordinateY] = useState(0);
    const [domTagName, setDomTagName] = useState("<none>");
    const [domId, setDomId] = useState("<none>");
    const [domRole, setDomRole] = useState("<none>");
    const [domAriaLabel, setDomAriaLabel] = useState("<none>");


    // IPC Receive Callbacks
    const onAppMessage = (event, arg) => {
        setAppMessage(arg.message);
        setAppMessageType(arg.type);
    };
    const onDOMDataFromMainToMainWindow = (event, arg) => {
        console.log(arg.coordinates.x + ", " + arg.coordinates.y);
        console.log(arg.tagName);
        console.log(arg.id);
        console.log(arg.role);
        console.log(arg.ariaLabel);
        setDomCoordinateX(arg.coordinates.x);
        setDomCoordinateY(arg.coordinates.y);
        setDomTagName(arg.tagName ? arg.tagName : "<none>");
        setDomId(arg.id ? arg.id : "<none>");
        setDomRole(arg.role ? arg.role : "<none>");
        setDomAriaLabel(arg.ariaLabel ? arg.ariaLabel : "<none>");
    };
    const onViewerClosed = (event, arg) => {
        setButtonState(0);
    };

    // useEffect
    useEffect(() => {
        // IPC Receive (from Main) Create Listener
        window.api.on("AppMessage", onAppMessage);
        window.api.on("DOMDataFromMainToMainWindow", onDOMDataFromMainToMainWindow);
        window.api.on("ViewerClosed", onViewerClosed);
        // Cleanup
        return () => {
            // IPC Receive (from Main) Remove Listener
            window.api.remove("AppMessage", onAppMessage);
            window.api.remove("DOMDataFromMainToMainWindow", onDOMDataFromMainToMainWindow);
            window.api.remove("ViewerClosed", onViewerClosed);
        };
    }, []);


    // onClicks
    const onOpenBrowserButton = () => {
        if (isBrowserURLValid && browserURL.length > 0) {
            console.log("OpenBrowserButton");
            window.api.send(
                // Channel
                "OpenBrowser",
                // Data
                {
                    url: browserURL
                }
            );
            setButtonState(1);
        } else {
            console.log("URL is invalid");
            setAppMessage("不正なURLのためコンテンツを開けません");
            setAppMessageType("error");
        }
    };
    const onStartButton = () => {
        console.log("StartButton");
        window.api.send(
            // Channel
            "StartAnalysis",
            // Data
            {}
        );
        setButtonState(2);
    };
    const onStopButton = () => {
        console.log("StopButton");
        window.api.send(
            // Channel
            "StopAnalysis",
            // Data
            {}
        );
        setButtonState(0);
    };


    // onChanges
    const onBrowserURLChange = (event) => {
        setBrowserURL(event.target.value);
        // Check if the given url is valid
        let url = "";
        try {
            url = new URL(event.target.value);
        } catch (_) {
            setIsBrowserURLValid(false);
            return;
        }
        setIsBrowserURLValid(true);
    };


    // JSX
    const classes = useStyles();
    return (
        <ThemeProvider theme={ customTheme }>
          <div className={classes.root}>
            { /* Header */ }
            <AppBar className={ classes.appBar } position="fixed" elevation={ 2 }>
              <Toolbar className={ classes.toolBar } variant="dense"
                       component="nav" role="navigation" aria-label="メニューバー">
                <Typography className={ classes.toolBarTitle } variant="h6" component="h1" color="inherit">
                  コンソール
                </Typography>
              </Toolbar>
            </AppBar>
            { /* Content */ }
            <Grid container spacing={ 3 }>
              <Grid item xs={ 12 }>
                <Paper elevation={ 3 }>
                  <Alert severity={ appMessageType }>
                    { appMessage }
                  </Alert>
                </Paper>
              </Grid>
              <Grid item xs={ 12 }>
                <Paper className={classes.paper} elevation={ 3 }>
                  <List aria-labelledby="config-list-subheader"
                        subheader={
                            <ListSubheader component="div" id="config-list-subheader">
                              セットアップ
                            </ListSubheader>
                        }>
                    <ListItem>
                      <ListItemIcon>
                        <WebIcon />
                      </ListItemIcon>
                      <ListItemText primary="URL" />
                      <ListItemSecondaryAction>
                        <TextField className={ classes.textfield }
                                   name="browserURLField"
                                   label="Webコンテンツ"
                                   helperText={ !isBrowserURLValid && "URLが不正です" }
                                   value={ browserURL }
                                   onChange={ onBrowserURLChange }
                                   error={ !isBrowserURLValid }/>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                  <div className={ classes.buttonGroupContainer } >
                    <ButtonGroup disableElevation variant="contained" color="primary">
                      <Button onClick={ onOpenBrowserButton }
                              disabled={ buttonState === 0 ? false : true }>ブラウザを開く</Button>
                      <Button onClick={ onStartButton }
                              disabled={ buttonState === 1 ? false : true }>計測開始</Button>
                      <Button onClick={ onStopButton }
                              disabled={ buttonState === 2 ? false : true }>計測終了</Button>
                    </ButtonGroup>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={ 12 }>
                <Paper className={ classes.paper } elevation={ 3 }>
                  <List aria-labelledby="debug-list-subheader"
                        subheader={
                            <ListSubheader component="div" id="debug-list-subheader">
                              注視要素
                            </ListSubheader>
                        }>
                    <ListItem>
                      <ListItemIcon>
                        <LocationSearchingIcon />
                      </ListItemIcon>
                      <ListItemText primary="Coordinates" secondary="Viewport" />
                      <ListItemSecondaryAction className={ classes.debugListItemSecondaryAction }>
                        <Typography variant="body1" component="p" color="inherit">
                          X: { domCoordinateX }, Y: {domCoordinateY}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider/>
                    <ListItem>
                      <ListItemIcon>
                        <CodeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Tag" secondary="HTML5" />
                      <ListItemSecondaryAction className={ classes.debugListItemSecondaryAction }>
                        <Typography variant="body1" component="p" color="inherit">
                          { domTagName }
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider/>
                    <ListItem>
                      <ListItemIcon>
                        <CodeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Role" secondary="WAI-ARIA"/>
                      <ListItemSecondaryAction className={ classes.debugListItemSecondaryAction }>
                        <Typography variant="body1" component="p" color="inherit">
                          { domRole }
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider/>
                    <ListItem>
                      <ListItemIcon>
                        <CropFreeIcon />
                      </ListItemIcon>
                      <ListItemText primary="ID" secondary="HTML5" />
                      <ListItemSecondaryAction className={ classes.debugListItemSecondaryAction }>
                        <Typography variant="body1" component="p" color="inherit">
                          { domId }
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider/>
                    <ListItem>
                      <ListItemIcon>
                        <LabelIcon />
                      </ListItemIcon>
                      <ListItemText primary="Label" secondary="WAI-ARIA"/>
                      <ListItemSecondaryAction className={ classes.debugListItemSecondaryAction }>
                        <Typography variant="body1" component="p" color="inherit">
                          { domAriaLabel }
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </div>
        </ThemeProvider>
    );
};


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
