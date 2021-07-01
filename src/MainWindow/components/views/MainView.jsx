// System
import React, { useState, useEffect } from 'react';
//// Material-UI
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AppBar, Toolbar, Grid, Paper, Typography } from '@material-ui/core';
import { List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Divider } from '@material-ui/core';
import { Accordion, AccordionSummary, AccordionDetails, AccordionActions } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { ButtonGroup, Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { grey, blueGrey, brown } from '@material-ui/core/colors';
import WebIcon from '@material-ui/icons/Web';
import DescriptionIcon from '@material-ui/icons/Description';
import TheatersIcon from '@material-ui/icons/Theaters';
import SearchIcon from '@material-ui/icons/Search';
import CodeIcon from '@material-ui/icons/Code';
import LabelIcon from '@material-ui/icons/Label';
import CropFreeIcon from '@material-ui/icons/CropFree';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import LayersIcon from '@material-ui/icons/Layers'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { SnackbarProvider, useSnackbar } from 'notistack';


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
    // Heading
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
        color: SystemColor.Black,
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
        color: SystemColor.Black
    },
    // Debug Table Heading
    debugTableHeading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
        color: SystemColor.Black,
        marginLeft: theme.spacing( 3 )
    },
    // Debug Table: Icon Margin
    debugTableIcon: {
        marginRight: theme.spacing( 3 ),
        marginLeft: theme.spacing( 3 ),
        verticalAlign: 'sub'
    }
}));


// Main Component
const MainViewContent = () => {
    // useState
    const [buttonState, setButtonState] = useState(0);
    const [doesViewerWindowExists, setDoesViewerWindowExists] = useState(false);

    const [appMessage, setAppMessage] = useState("起動しました");
    const [appMessageType, setAppMessageType] = useState("success");
    const [browserURL, setBrowserURL] = useState("file:///Users/kawa/Wakayama/2021/HCDLab/sample/eta-sample-menu/build/index.html");
    const [isBrowserURLValid, setIsBrowserURLValid] = useState(true);
    // CSV Destination Path
    const [csvDestinationPath, setCsvDestinationPath] = useState("");
    // Capture Destination Path
    const [captureDestinationPath, setCaptureDestinationPath] = useState("");

    // Coordinates
    const [domCoordinateX, setDomCoordinateX] = useState(0);
    const [domCoordinateY, setDomCoordinateY] = useState(0);
    // Main Target Element
    const [domIsTarget, setDomIsTarget] = useState("not");
    const [domTagName, setDomTagName] = useState("<none>");
    const [domId, setDomId] = useState("<none>");
    const [domRole, setDomRole] = useState("<none>");
    const [domAriaLabel, setDomAriaLabel] = useState("<none>");
    // Parent Target Element
    const [parentDomIsTarget, setParentDomIsTarget] = useState("not");
    const [parentDomCoordinateX, setParentDomCoordinateX] = useState(0);
    const [parentDomCoordinateY, setParentDomCoordinateY] = useState(0);
    const [parentDomTagName, setParentDomTagName] = useState("<none>");
    const [parentDomId, setParentDomId] = useState("<none>");
    const [parentDomRole, setParentDomRole] = useState("<none>");
    const [parentDomAriaLabel, setParentDomAriaLabel] = useState("<none>");
    // Element Path (Filtered)
    const [elemPath, setElemPath] = useState("<none>");
    // Element Path (All)
    const [elemPathAll, setElemPathAll] = useState("<none>");


    // IPC Receive Callbacks
    const onAppMessage = (event, arg) => {
        setAppMessage(arg.message);
        setAppMessageType(arg.type);
        enqueueSnackbar(arg.message, {
            variant: arg.type,
            autoHideDuration: 2000
        });
    };
    const onRespondCsvDestinationPath = (event, arg) => {
        setCsvDestinationPath(arg.path);
    };
    const onRespondCaptureDestinationPath = (event, arg) => {
        setCaptureDestinationPath(arg.path);
    };
    const onDOMDataFromMainToMainWindow = (event, arg) => {
        // Coordinates
        setDomCoordinateX(arg.coordinates.x);
        setDomCoordinateY(arg.coordinates.y);
        // Main Element
        setDomIsTarget(arg.mainElement.isTarget ? "target" : "not");
        setDomTagName(arg.mainElement.tagName ? arg.mainElement.tagName : "<none>");
        setDomId(arg.mainElement.id ? arg.mainElement.id : "<none>");
        setDomRole(arg.mainElement.role ? arg.mainElement.role : "<none>");
        setDomAriaLabel(arg.mainElement.ariaLabel ? arg.mainElement.ariaLabel : "<none>");
        // Parent Element
        setParentDomIsTarget(arg.parentElement.isTarget ? "target" : "not");
        setParentDomTagName(arg.parentElement.tagName ? arg.parentElement.tagName : "<none>");
        setParentDomId(arg.parentElement.id ? arg.parentElement.id : "<none>");
        setParentDomRole(arg.parentElement.role ? arg.parentElement.role : "<none>");
        setParentDomAriaLabel(arg.parentElement.ariaLabel ? arg.parentElement.ariaLabel : "<none>");
        // Element Path (Filtered)
        setElemPath(arg.elemPath ? arg.elemPath : "<none>");
        // Element Path (All)
        setElemPathAll(arg.elemPathAll ? arg.elemPathAll : "<none>");
    };
    const onViewerClosed = (event, arg) => {
        // Button State
        setButtonState(1);
        setDoesViewerWindowExists(false);
        // Coordinates
        setDomCoordinateX(0);
        setDomCoordinateY(0);
        // Main Element
        setDomIsTarget("not");
        setDomTagName("<none>");
        setDomId("<none>");
        setDomRole("<none>");
        setDomAriaLabel("<none>");
        // Parent Element
        setParentDomIsTarget("not");
        setParentDomTagName("<none>");
        setParentDomId("<none>");
        setParentDomRole("<none>");
        setParentDomAriaLabel("<none>");
        // Element Path (Filtered)
        setElemPath("<none>");
        // Element Path (All)
        setElemPathAll("<none>");
    };

    // useEffect
    useEffect(() => {
        // IPC Receive (from Main) Create Listener
        window.api.on("AppMessage", onAppMessage);
        window.api.on("RespondCsvDestinationPath", onRespondCsvDestinationPath);
        window.api.on("RespondCaptureDestinationPath", onRespondCaptureDestinationPath);
        window.api.on("DOMDataFromMainToMainWindow", onDOMDataFromMainToMainWindow);
        window.api.on("ViewerClosed", onViewerClosed);
        // Cleanup
        return () => {
            // IPC Receive (from Main) Remove Listener
            window.api.remove("AppMessage", onAppMessage);
            window.api.remove("RespondCsvDestinationPath", onRespondCsvDestinationPath);
            window.api.remove("RespondCaptureDestinationPath", onRespondCaptureDestinationPath);
            window.api.remove("DOMDataFromMainToMainWindow", onDOMDataFromMainToMainWindow);
            window.api.remove("ViewerClosed", onViewerClosed);
        };
    }, []);

    useEffect(() => {
        // No active button
        if (buttonState === 0) {
            if (csvDestinationPath === "" && captureDestinationPath !== "") {
                // CSV path is not initialized, but capture path is initialized
                // Initialize csv path with capture path
                setCsvDestinationPath(captureDestinationPath.substr(0, captureDestinationPath.lastIndexOf(".")) + ".csv");
                setButtonState(1);
            } else if (csvDestinationPath !== "" && captureDestinationPath === "") {
                // Capture path is not initialized, but csv path is initialized
                // Initialize capture path with csv path
                setCaptureDestinationPath(csvDestinationPath.substr(0, csvDestinationPath.lastIndexOf(".")) + ".webm");
                setButtonState(1);
            } else if (csvDestinationPath !== "" && captureDestinationPath !== "") {
                // Both paths are not empty
                if (doesViewerWindowExists === false) {
                    // No Viewer exists
                    setButtonState(1);
                }
            }
        } else if (buttonState === 1) {
            // "OpenBrowser" button is active
            if (doesViewerWindowExists) {
                // There is an opened browser
                setButtonState(0);
            }
        }
    }, [csvDestinationPath, captureDestinationPath, buttonState, doesViewerWindowExists]);

    // useSnackbar (notistack)
    const { enqueueSnackbar } = useSnackbar();


    // onClicks
    const onSelectCsvDestinationPath = () => {
        window.api.send("RequestCsvDestinationPath", {});
    };
    const onSelectCaptureDestinationPath = () => {
        window.api.send("RequestCaptureDestinationPath", {});
    };

    const onOpenBrowserButton = () => {
        if (isBrowserURLValid && browserURL.length > 0) {
            console.log("OpenBrowserButton");
            window.api.send("OpenBrowser", {
                url: browserURL
            });
            setButtonState(2);
            setDoesViewerWindowExists(true);
        } else {
            console.log("URL is invalid");
            setAppMessage("不正なURLのためコンテンツを開けません");
            setAppMessageType("error");
            enqueueSnackbar("不正なURLのためコンテンツを開けません", {
                variant: "error",
                autoHideDuration: 2000
            });
        }
    };
    const onStartButton = () => {
        console.log("StartButton");
        window.api.send("StartAnalysis", {});
        setButtonState(3);
    };
    const onStopButton = () => {
        console.log("StopButton");
        window.api.send("StopAnalysis", {});
        setButtonState(1);
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
              <Paper>
                <Alert variant="filled" severity={ appMessageType }>
                  { appMessage }
                </Alert>
              </Paper>
            </Grid>
            <Grid item xs={ 12 }>
              <Accordion defaultExpanded={ true }>
                <AccordionSummary expandIcon={ <ExpandMoreIcon /> }
                                  aria-controls="setup-list-panel-content"
                                  id="setup-list-panel-header">
                  <Typography className={ classes.heading } component="h2">セットアップ</Typography>
                </AccordionSummary>
                <AccordionDetails className={ classes.setupAccordionDetails }>
                  <List aria-labelledby="config-list-subheader">
                    <ListItem>
                      <ListItemIcon>
                        <WebIcon />
                      </ListItemIcon>
                      <ListItemText primary="対象のURL" />
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
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText primary="CSVファイルの保存先" />
                      <ListItemSecondaryAction>
                        <div className={ classes.pathSelector }>
                          <Typography className={ classes.destinationPath } variant="body1">
                            { csvDestinationPath }
                          </Typography>
                          <Button variant="contained" color="primary"
                                  onClick={ onSelectCsvDestinationPath }>
                            参照…
                          </Button>
                        </div>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TheatersIcon />
                      </ListItemIcon>
                      <ListItemText primary="キャプチャの保存先" />
                      <ListItemSecondaryAction>
                        <div className={ classes.pathSelector }>
                          <Typography className={ classes.destinationPath } variant="body1">
                            { captureDestinationPath }
                          </Typography>
                          <Button variant="contained" color="primary"
                                  onClick={ onSelectCaptureDestinationPath }>
                            参照…
                          </Button>
                        </div>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </AccordionDetails>
                <AccordionActions className={ classes.setupAccordionActions }>
                  <ButtonGroup variant="contained" color="primary">
                    <Button onClick={ onOpenBrowserButton }
                            disabled={ buttonState === 1 ? false : true }>ブラウザを開く</Button>
                    <Button onClick={ onStartButton }
                            disabled={ buttonState === 2 ? false : true }>計測開始</Button>
                    <Button onClick={ onStopButton }
                            disabled={ buttonState === 3 ? false : true }>計測終了</Button>
                  </ButtonGroup>
                </AccordionActions>
              </Accordion>
            </Grid>
            <Grid item xs={ 12 }>
              <Accordion>
                <AccordionSummary expandIcon={ <ExpandMoreIcon /> }
                                  aria-controls="debug-table-panel-content"
                                  id="debug-table-panel-header">
                  <Typography className={ classes.debugTableHeading } component="h2">注視要素</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small" aria-label="現在の注視要素に関する情報の一覧">
                      <caption>現在の注視要素に関する情報の一覧</caption>
                      <TableHead>
                        <TableRow>
                          <TableCell ></TableCell>
                          <TableCell align="center">Main</TableCell>
                          <TableCell align="center">Parent</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th">
                            <LocationSearchingIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Coordinates
                          </TableCell>
                          <TableCell align="center" colSpan={ 2 }>X: { domCoordinateX }, Y: {domCoordinateY}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <SearchIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Target or not
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (domIsTarget === "not" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { domIsTarget }
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (parentDomIsTarget === "not" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { parentDomIsTarget }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <CodeIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Tag
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (domTagName === "<none>" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { domTagName }
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (parentDomTagName === "<none>" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { parentDomTagName }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <CodeIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Role
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (domRole === "<none>" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { domRole }
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (parentDomRole === "<none>" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { parentDomRole }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <CropFreeIcon className={ classes.debugTableIcon } fontSize="small"/>
                            ID
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (domId === "<none>" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { domId }
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (parentDomId === "<none>" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { parentDomId }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <LabelIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Label
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (domAriaLabel === "<none>" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { domAriaLabel }
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (parentDomAriaLabel === "<none>" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { parentDomAriaLabel }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <LayersIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Layers (Filtered)
                          </TableCell>
                          <TableCell align="center" colSpan={ 2 }
                                     style={ { color: (elemPath === "<none>" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { elemPath }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <LayersIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Layers (All)
                          </TableCell>
                          <TableCell align="center" colSpan={ 2 }
                                     style={ { color: (elemPathAll === "<none>" ) ? SystemColor.ExtraDarkGrey : SystemColor.Black } }>
                            { elemPathAll }
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </div>
    );
};

const MainView = () => {
    return (
        <ThemeProvider theme={ customTheme }>
          <SnackbarProvider maxSnack={ 3 }>
            <MainViewContent />
          </SnackbarProvider>
        </ThemeProvider>
    );
}

// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
