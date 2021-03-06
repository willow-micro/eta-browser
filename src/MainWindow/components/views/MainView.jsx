// -*- coding: utf-8-unix -*-
// ETA-Browser
// MainWindow Main View

///////////////////////////////////////////////////////////////////////////////
//                                   Import                                  //
///////////////////////////////////////////////////////////////////////////////
// System /////////////////////////////////////////////////////////////////////
// React
import React, { useState, useEffect } from 'react';
// Material-UI
import { ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Toolbar, Grid, Paper, Typography, Tooltip } from '@material-ui/core';
import { List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Divider } from '@material-ui/core';
import { Accordion, AccordionSummary, AccordionDetails, AccordionActions } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { IconButton, ButtonGroup, Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import TuneIcon from '@material-ui/icons/Tune';
import DnsIcon from '@material-ui/icons/Dns';
import WebIcon from '@material-ui/icons/Web';
import DescriptionIcon from '@material-ui/icons/Description';
import TheatersIcon from '@material-ui/icons/Theaters';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import CodeIcon from '@material-ui/icons/Code';
//import LabelIcon from '@material-ui/icons/Label';
//import CropFreeIcon from '@material-ui/icons/CropFree';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import LayersIcon from '@material-ui/icons/Layers'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// Notistack
import { SnackbarProvider, useSnackbar } from 'notistack';
// User ///////////////////////////////////////////////////////////////////////
import { CustomColorPalette, CustomTheme, useStyles } from './MainViewStyles';
import ConfigsView from './ConfigsView.jsx';
import { ConfigsProvider, useConfigsContext } from '../../contexts/ConfigsContext.jsx';


///////////////////////////////////////////////////////////////////////////////
//                               Main Component                              //
///////////////////////////////////////////////////////////////////////////////
const MainViewContent = () => {
    // React Hooks State
    // Configs Dialog
    const [isConfigsDialogOpen, setIsConfigsDialogOpen] = useState(false);
    // Button group
    const [buttonState, setButtonState] = useState(0);
    const [doesViewerWindowExists, setDoesViewerWindowExists] = useState(false);
    // App Message
    const [appMessage, setAppMessage] = useState("??????????????????");
    const [appMessageType, setAppMessageType] = useState("success");
    // WebSocket Server path
    const [webSocketURL, setWebSocketURL] = useState("ws://localhost:8008/SBET");
    const [isWebSocketURLValid, setIsWebSocketURLValid] = useState(true);
    // Viewer Destination URL
    const [browserURL, setBrowserURL] = useState("file:///C:/Users/s236327/node/eta-sample-menu/build/index.html");
    const [isBrowserURLValid, setIsBrowserURLValid] = useState(true);
    // CSV Destination Path
    const [csvDestinationPath, setCsvDestinationPath] = useState("");
    // Capture Destination Path
    const [captureDestinationPath, setCaptureDestinationPath] = useState("");
    // DOM Data Preview
    //// Coordinates
    const [domCoordinateX, setDomCoordinateX] = useState(0);
    const [domCoordinateY, setDomCoordinateY] = useState(0);
    //// Element Overlap (All)
    const [elemOverlapAll, setElemOverlapAll] = useState("<none>");
    //// Element Overlap (Filtered)
    const [elemOverlapFiltered, setElemOverlapFiltered] = useState("<none>");
    //// TagName
    const [domTagName, setDomTagName] = useState("<none>");

    // React Hooks Context
    // Configs
    const { configs, setConfigs } = useConfigsContext();


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
    const onAllowToStartAnalysis = (event, arg) => {
        setButtonState(2);
    };
    const onDOMDataFromMainToMainWindow = (event, arg) => {
        // Coordinates
        setDomCoordinateX(arg.coordinates.x);
        setDomCoordinateY(arg.coordinates.y);
        // Element Overlap (Filtered)
        setElemOverlapFiltered(arg.elemOverlapFiltered ? arg.elemOverlapFiltered : "<none>");
        // Element Overlap (All)
        setElemOverlapAll(arg.elemOverlapAll ? arg.elemOverlapAll : "<none>");
        // TagName
        setDomTagName(arg.leafSideElementData[0].tagName ? arg.leafSideElementData[0].tagName : "<none>");
    };
    const onViewerClosed = (event, arg) => {
        // Button State
        setButtonState(1);
        setDoesViewerWindowExists(false);
        // Coordinates
        setDomCoordinateX(0);
        setDomCoordinateY(0);
        // Element Overlap (All)
        setElemOverlapAll("<none>");
        // Element Overlap (Filtered)
        setElemOverlapFiltered("<none>");
        // Main Element
        setDomTagName("<none>");
    };

    // React Hooks useEffect
    //// IPC Effects
    useEffect(() => {
        // IPC Receive (from Main) Create Listener
        window.api.on("AppMessage", onAppMessage);
        window.api.on("RespondCsvDestinationPath", onRespondCsvDestinationPath);
        window.api.on("RespondCaptureDestinationPath", onRespondCaptureDestinationPath);
        window.api.on("AllowToStartAnalysis", onAllowToStartAnalysis);
        window.api.on("DOMDataFromMainToMainWindow", onDOMDataFromMainToMainWindow);
        window.api.on("ViewerClosed", onViewerClosed);
        // Cleanup
        return () => {
            // IPC Receive (from Main) Remove Listener
            window.api.remove("AppMessage", onAppMessage);
            window.api.remove("RespondCsvDestinationPath", onRespondCsvDestinationPath);
            window.api.remove("RespondCaptureDestinationPath", onRespondCaptureDestinationPath);
            window.api.remove("AllowToStartAnalysis", onAllowToStartAnalysis);
            window.api.remove("DOMDataFromMainToMainWindow", onDOMDataFromMainToMainWindow);
            window.api.remove("ViewerClosed", onViewerClosed);
        };
    }, []);
    //// Button group Effects
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

    // Notistack useSnackbar
    const { enqueueSnackbar } = useSnackbar();


    // React Event onClicks
    const onOpenConfigsDialogButton = () => {
        setIsConfigsDialogOpen(true);
        console.log(configs);
    };
    const onCloseConfigsDialogButton = () => {
        setIsConfigsDialogOpen(false);
    };
    const onSelectCsvDestinationPathButton = () => {
        window.api.send("RequestCsvDestinationPath", {});
    };
    const onSelectCaptureDestinationPathButton = () => {
        window.api.send("RequestCaptureDestinationPath", {});
    };
    const onOpenViewerButton = () => {
        console.log("OpenViewerButton");
        // Start ws client and Open viewer window
        if (isWebSocketURLValid && webSocketURL.length > 0) {
            if (isBrowserURLValid && browserURL.length > 0) {
                window.api.send("OpenViewer", {
                    webSocketURL: webSocketURL,
                    browserURL: browserURL,
                    configs: configs
                });
                setButtonState(0);
                setDoesViewerWindowExists(true);
            } else {
                console.log("URL is invalid");
                setAppMessage("?????????URL??????????????????????????????????????????");
                setAppMessageType("error");
                enqueueSnackbar("?????????URL??????????????????????????????????????????", {
                    variant: "error",
                    autoHideDuration: 2000
                });
            }
        } else {
            console.log("WS URL is invalid");
            setAppMessage("?????????URL?????????WebSocket?????????????????????????????????");
            setAppMessageType("error");
            enqueueSnackbar("?????????URL?????????WebSocket?????????????????????????????????", {
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


    // React Event onChanges
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
    const onWebSocketURLChange = (event) => {
        setWebSocketURL(event.target.value);
        // Check if the given url is valid
        let url = "";
        try {
            url = new URL(event.target.value);
        } catch (_) {
            setIsWebSocketURLValid(false);
            return;
        }
        setIsWebSocketURLValid(true);
    };


    // JSX
    const classes = useStyles();
    return (
        <div className={classes.root}>
          { /* Header */ }
          <AppBar className={ classes.appBar } position="fixed" elevation={ 2 }>
            <Toolbar className={ classes.toolBar } variant="dense"
                     component="nav" role="navigation" aria-label="??????????????????">
              <Typography className={ classes.toolBarTitle } variant="h6" component="h1" color="inherit">
                ???????????????
              </Typography>
              <Tooltip title="?????????????????????">
                <IconButton color="inherit" aria-label="?????????????????????"
                            onClick={ onOpenConfigsDialogButton }>
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
                  <Typography className={ classes.heading } component="h2">??????????????????</Typography>
                </AccordionSummary>
                <AccordionDetails className={ classes.setupAccordionDetails }>
                  <List aria-labelledby="config-list-subheader">
                    <ListItem>
                      <ListItemIcon>
                        <DnsIcon />
                      </ListItemIcon>
                      <ListItemText primary="??????????????????" />
                      <ListItemSecondaryAction>
                        <TextField className={ classes.textfield } variant="outlined" size="small"
                                   name="webSocketURLField" label="URL"
                                   helperText={ !isWebSocketURLValid && "URL???????????????" }
                                   value={ webSocketURL }
                                   onChange={ onWebSocketURLChange }
                                   error={ !isWebSocketURLValid } />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WebIcon />
                      </ListItemIcon>
                      <ListItemText primary="???????????????" />
                      <ListItemSecondaryAction>
                        <TextField className={ classes.textfield } variant="outlined" size="small"
                                   name="browserURLField" label="URL"
                                   helperText={ !isBrowserURLValid && "URL???????????????" }
                                   value={ browserURL }
                                   onChange={ onBrowserURLChange }
                                   error={ !isBrowserURLValid } />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText primary="CSV????????????" secondary={ csvDestinationPath } />
                      <ListItemSecondaryAction>
                        <Button variant="contained" size="small" color="primary" endIcon={ <OpenInNewIcon /> }
                                onClick={ onSelectCsvDestinationPathButton }>
                          ??????????????????
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TheatersIcon />
                      </ListItemIcon>
                      <ListItemText primary="?????????????????????" secondary={ captureDestinationPath } />
                      <ListItemSecondaryAction>
                        <Button variant="contained" size="small" color="primary" endIcon={ <OpenInNewIcon /> }
                                onClick={ onSelectCaptureDestinationPathButton }>
                          ??????????????????
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </AccordionDetails>
                <AccordionActions className={ classes.setupAccordionActions }>
                  <ButtonGroup variant="contained" color="primary">
                    <Button onClick={ onOpenViewerButton }
                            disabled={ buttonState === 1 ? false : true }>?????????????????????</Button>
                    <Button onClick={ onStartButton }
                            disabled={ buttonState === 2 ? false : true }>????????????</Button>
                    <Button onClick={ onStopButton }
                            disabled={ buttonState === 3 ? false : true }>????????????</Button>
                  </ButtonGroup>
                </AccordionActions>
              </Accordion>
            </Grid>
            <Grid item xs={ 12 }>
              <Accordion>
                <AccordionSummary expandIcon={ <ExpandMoreIcon /> }
                                  aria-controls="debug-table-panel-content"
                                  id="debug-table-panel-header">
                  <Typography className={ classes.heading } component="h2">??????????????????????????????</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small" aria-label="????????????????????????????????????????????????">
                      <caption>????????????????????????????????????????????????</caption>
                      <TableHead>
                        <TableRow>
                          <TableCell ></TableCell>
                          <TableCell align="center">Leaf Side Element (1)</TableCell>
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
                            Element Overlap (All)
                          </TableCell>
                          <TableCell align="center" colSpan={ 2 }
                                     style={ { color: (elemOverlapAll === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { elemOverlapAll }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            <LayersIcon className={ classes.debugTableIcon } fontSize="small"/>
                            Element Overlap (Filtered)
                          </TableCell>
                          <TableCell align="center" colSpan={ 2 }
                                     style={ { color: (elemOverlapFiltered === "<none>" ) ? CustomColorPalette.ExtraDarkGrey : CustomColorPalette.Black } }>
                            { elemOverlapFiltered }
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
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
          { /* Configs Dialog */ }
          <ConfigsView open={ isConfigsDialogOpen } onClose={ onCloseConfigsDialogButton } />
        </div>
    );
};

///////////////////////////////////////////////////////////////////////////////
//                               Real Component                              //
///////////////////////////////////////////////////////////////////////////////
const MainView = () => {
    return (
        <ConfigsProvider>
          <ThemeProvider theme={ CustomTheme }>
            <SnackbarProvider maxSnack={ 3 }>
              <MainViewContent />
            </SnackbarProvider>
          </ThemeProvider>
        </ConfigsProvider>
    );
}

///////////////////////////////////////////////////////////////////////////////
//                                   Export                                  //
///////////////////////////////////////////////////////////////////////////////
// Function Component????????????????????????export????????????????????????
// ?????????export???????????????????????????????????????????????????????????????????????????const?????????????????????????????????
export default MainView;
