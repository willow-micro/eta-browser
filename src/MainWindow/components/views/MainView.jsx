// System
import React, { useState, useEffect } from 'react';
//// Material-UI
import { ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Toolbar, Grid, Paper, Typography, Tooltip } from '@material-ui/core';
import { List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Divider } from '@material-ui/core';
import { Accordion, AccordionSummary, AccordionDetails, AccordionActions } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { Dialog, Slide } from '@material-ui/core';
import { IconButton, ButtonGroup, Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import TuneIcon from '@material-ui/icons/Tune';
import WebIcon from '@material-ui/icons/Web';
import DescriptionIcon from '@material-ui/icons/Description';
import TheatersIcon from '@material-ui/icons/Theaters';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import SearchIcon from '@material-ui/icons/Search';
import CodeIcon from '@material-ui/icons/Code';
import LabelIcon from '@material-ui/icons/Label';
import CropFreeIcon from '@material-ui/icons/CropFree';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import LayersIcon from '@material-ui/icons/Layers'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
////// Notistack
import { SnackbarProvider, useSnackbar } from 'notistack';

// User
import { CustomColorPalette, CustomTheme, useStyles } from './MainViewStyles';


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
            // "OpenViewer" button is active
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

    const onOpenViewerButton = () => {
        if (isBrowserURLValid && browserURL.length > 0) {
            console.log("OpenViewerButton");
            window.api.send("OpenViewer", {
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
              <Tooltip title="分析条件の変更">
                <IconButton color="inherit" aria-label="分析条件の変更">
                  <TuneIcon />
                </IconButton>
              </Tooltip>
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
                      <ListItemText primary="CSVファイルの保存先" secondary={ csvDestinationPath } />
                      <ListItemSecondaryAction>
                        <Button variant="contained" color="primary" endIcon={ <OpenInNewIcon /> }
                                onClick={ onSelectCsvDestinationPath }>
                          参照
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TheatersIcon />
                      </ListItemIcon>
                      <ListItemText primary="キャプチャの保存先" secondary={ captureDestinationPath } />
                      <ListItemSecondaryAction>
                        <Button variant="contained" color="primary" endIcon={ <OpenInNewIcon /> }
                                onClick={ onSelectCaptureDestinationPath }>
                          参照
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </AccordionDetails>
                <AccordionActions className={ classes.setupAccordionActions }>
                  <ButtonGroup variant="contained" color="primary">
                    <Button onClick={ onOpenViewerButton }
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
                            <LayersIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Overlap (All)
                          </TableCell>
                          <TableCell align="center" colSpan={ 2 }
                                     style={ { color: (elemPathAll === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { elemPathAll }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <LayersIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Overlap (Filtered)
                          </TableCell>
                          <TableCell align="center" colSpan={ 2 }
                                     style={ { color: (elemPath === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { elemPath }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <SearchIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Filtered target or not
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (domIsTarget === "not" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { domIsTarget }
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (parentDomIsTarget === "not" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { parentDomIsTarget }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <CodeIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Tag
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (domTagName === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { domTagName }
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (parentDomTagName === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { parentDomTagName }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <CodeIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Role
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (domRole === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { domRole }
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (parentDomRole === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { parentDomRole }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <CropFreeIcon className={ classes.debugTableIcon } fontSize="small"/>
                            ID
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (domId === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { domId }
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (parentDomId === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { parentDomId }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <LabelIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Label
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (domAriaLabel === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { domAriaLabel }
                          </TableCell>
                          <TableCell align="center"
                                     style={ { color: (parentDomAriaLabel === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { parentDomAriaLabel }
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
        <ThemeProvider theme={ CustomTheme }>
          <SnackbarProvider maxSnack={ 3 }>
            <MainViewContent />
          </SnackbarProvider>
        </ThemeProvider>
    );
}

// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
