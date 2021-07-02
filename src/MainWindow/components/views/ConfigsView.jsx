// System
import React, { useState, useEffect } from 'react';
//// Material-UI
import { ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Toolbar, Grid, Typography, Tooltip } from '@material-ui/core';
import { Dialog, Slide } from '@material-ui/core';
import { Chip, Slider } from '@material-ui/core';
import { Accordion, AccordionSummary, AccordionDetails, AccordionActions, Divider } from '@material-ui/core';
import { Button, TextField } from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// User
import { CustomColorPalette, useStyles } from './ConfigsViewStyles';
import { ConfigsProvider, useConfigsContext } from '../../contexts/ConfigsContext.jsx';


// Transition for opening the configs dialog
const ConfigsDialogTransition = React.forwardRef((props, ref) => {
    return <Slide direction="up" ref={ ref } { ...props } />;
});

// Sliders
const leafAdoptSliderMarks = [
    {
        value: 0,
        label: "←子要素"
    },
    {
        value: 1,
        label: "1階層"
    },
    {
        value: 2,
        label: "2階層"
    },
    {
        value: 3,
        label: "3階層"
    }
];
const rootAdoptSliderMarks = [
    {
        value: 0,
        label: "-3階層"
    },
    {
        value: 1,
        label: "-2階層"
    },
    {
        value: 2,
        label: "-1階層"
    },
    {
        value: 3,
        label: "親要素→"
    }
];

const getLeafAdoptSliderValueText = (value) => {
    if (value <= 0) {
        return "なし";
    }
    return `${value}`;
};
const getRootAdoptSliderValueText = (value) => {
    if (value >= 3) {
        return "なし";
    }
    return `-${3 - value}`;
};


// Main Component
const ConfigsView = (props) => {
    // React Hooks State
    // open
    const [ isDialogOpen, setIsDialogOpen ] = useState(false);
    // Configs (local state)
    const [ filterTagNames, setFilterTagNames ] = useState(null);
    const [ filterAttributes, setFilterAttributes ] = useState(null);
    const [ adoptRange, setAdoptRange ] = useState(null);
    const [ generalDataCollection, setGeneralDataCollection ] = useState(null);
    const [ elementDataCollection, setElementDataCollection ] = useState(null);
    // Input
    const [newFilterTagName, setNewFilterTagName] = useState("");
    const [isNewFilterTagNameValid, setIsNewFilterTagNameValid] = useState(true);
    const [newFilterAttributes, setNewFilterAttributes] = useState("");
    const [isNewFilterAttributesValid, setIsNewFilterAttributesValid] = useState(true);


    // React Hooks Context
    // Configs (global context)
    const { configs, setConfigs } = useConfigsContext();


    // React Hooks Effect
    // "open" property Effect
    useEffect(() => {
        setIsDialogOpen(props.open);
        if (props.open) {
            const filterTagNamesForChips = [];
            for (let i = 0; i < configs.filterTagNames.length; i++) {
                filterTagNamesForChips.push({ key: i, label: configs.filterTagNames[i] });
            }
            setFilterTagNames(filterTagNamesForChips);
            const filterAttributesForChips = [];
            for (let i = 0; i < configs.filterAttributes.length; i++) {
                filterAttributesForChips.push({ key: i, label: configs.filterAttributes[i] });
            }
            setFilterAttributes(filterAttributesForChips);
            const adoptRangeForSlider = [configs.adoptRange.leaf, configs.adoptRange.root];
            setAdoptRange(adoptRangeForSlider);
            setGeneralDataCollection(configs.generalDataCollection);
            setElementDataCollection(configs.elementDataCollection);
        }
    }, [props.open]);


    // React Event onDeletes
    const onDeleteFilterTagNamesChip = (chipToDelete) => () => {
        setFilterTagNames((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
    };
    const onDeleteFilterAttributesChip = (chipToDelete) => () => {
        setFilterAttributes((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
    };

    // React Event onClicks
    const onSaveConfigs = () => {
        const filterTagNamesArray = [];
        for (let i = 0; i < filterTagNames.length; i++) {
            filterTagNamesArray.push(filterTagNames[i].label);
        }
        const filterAttributesArray = [];
        for (let i = 0; i < filterAttributes.length; i++) {
            filterAttributesArray.push(filterAttributes[i].label);
        }
        setConfigs({
            // Initial Configs
            filterTagNames: filterTagNamesArray,
            filterAttributes: filterAttributesArray,
            adoptRange: {
                leaf: adoptRange[0],
                root: adoptRange[1]
            },
            generalDataCollection: {
                coordinates: true,
                overlapAll: true,
                overlapFiltered: true
            },
            elementDataCollection: {
                tagName: true,
                attributes: ["id", "role", "aria-label"]
            }
        });
        props.onClose();
    };
    const onAddNewFilterTagName = () => {
        if (isNewFilterTagNameValid) {
            setFilterTagNames([...filterTagNames, { key: filterTagNames.length, label: newFilterTagName }]);
        }
        setNewFilterTagName("");
        setIsNewFilterTagNameValid(true);
    };
    const onAddNewFilterAttributes = () => {
        if (isNewFilterAttributesValid) {
            setFilterAttributes([...filterAttributes, { key: filterAttributes.length, label: newFilterAttributes }]);
        }
        setNewFilterAttributes("");
        setIsNewFilterAttributesValid(true);
    };

    // React Event onChanges
    const onNewFilterTagNameChange = (event) => {
        const name = event.target.value;
        setNewFilterTagName(name);
        // If Name Has Space(s)
        if (name.indexOf(' ') >= 0) {
            setIsNewFilterTagNameValid(false);
            return;
        }
        // If Exists
        for (let i = 0; i < filterTagNames.length; i++) {
            if (filterTagNames[i].label === name) {
                setIsNewFilterTagNameValid(false);
                return;
            }
        }
        // If Not Alphabet or Numbers
        if (/^[a-zA-Z0-9]*$/.test(name) === false) {
            setIsNewFilterTagNameValid(false);
            return;
        }
        // If Starts with a Number
        if (/^[0-9][a-zA-Z0-9]*$/.test(name) === true) {
            setIsNewFilterTagNameValid(false);
            return;
        }
        setIsNewFilterTagNameValid(true);
    };
    const onNewFilterAttributesChange = (event) => {
        const name = event.target.value;
        setNewFilterAttributes(name);
        // If Name Has Space(s)
        if (name.indexOf(' ') >= 0) {
            setIsNewFilterAttributesValid(false);
            return;
        }
        // If Exists
        for (let i = 0; i < filterAttributes.length; i++) {
            if (filterAttributes[i].label === name) {
                setIsNewFilterAttributesValid(false);
                return;
            }
        }
        // If Not Alphabet or Numbers
        if (/^[a-zA-Z0-9-]*$/.test(name) === false) {
            setIsNewFilterAttributesValid(false);
            return;
        }
        // If Starts with a Number
        if (/^[0-9][a-zA-Z0-9-]*$/.test(name) === true) {
            setIsNewFilterAttributesValid(false);
            return;
        }
        setIsNewFilterAttributesValid(true);
    };
    const onLeafAdoptSliderChange = (event, newValue) => {
        setAdoptRange([newValue, adoptRange[1]]);
    };
    const onRootAdoptSliderChange = (event, newValue) => {
        setAdoptRange([adoptRange[0], 3 - newValue]);
    };

    // JSX
    const classes = useStyles();
    return (
        <Dialog fullScreen open={ isDialogOpen } onClose={ props.onClose }
                TransitionComponent={ ConfigsDialogTransition }>
          <div className={classes.root}>
            <AppBar className={ classes.appBar } elevation={ 2 } position="sticky">
              <Toolbar className={ classes.toolBar } variant="dense"
                       component="nav" role="navigation" aria-label="分析条件変更画面のメニューバー">
                <Typography className={ classes.toolBarTitle } variant="h6" component="h1" color="inherit">
                  分析条件の変更
                </Typography>
                <Button className={ classes.dialogToolBarButton } variant="contained" color="primary" size="small" disableElevation
                        onClick={ props.onClose }
                        startIcon={ <CancelIcon /> }>
                  キャンセル
                </Button>
                <Button className={ classes.dialogToolBarButton } variant="contained" color="secondary" size="small" disableElevation
                        onClick={ onSaveConfigs }
                        startIcon={ <CheckCircleIcon /> }>
                  保存
                </Button>
              </Toolbar>
            </AppBar>
            <div className={ classes.dialogContent }>
              <Grid container spacing={ 3 }>
                <Grid item xs={ 12 }>
                  <Accordion defaultExpanded={ true }>
                    <AccordionSummary expandIcon={ <ExpandMoreIcon /> }
                                      aria-controls="configs-panel-1-content"
                                      id="configs-panel-1-header">
                      <Typography className={ classes.heading } component="h2">データ収集の対象となる要素</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={ 2 }>
                        <Grid item xs={ 12 }>
                          <Typography className={ classes.subheading } component="h3">以下の名前を持つ要素</Typography>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <ul className={ classes.chipsContainer }>
                            { filterTagNames && filterTagNames.map((data) => {
                                  return (
                                      <li key={ data.key }>
                                        <Chip className={ classes.chip } color="default" size="small"
                                              label={ data.label }
                                              onDelete={ onDeleteFilterTagNamesChip(data) } />
                                      </li>
                                  );
                            }) }
                          </ul>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <div className={ classes.newChipContainer }>
                            <TextField className={ classes.newChipTextfield } variant="outlined" size="small"
                                       label="要素を追加"
                                       name="newFilterTagNameTextfield"
                                       helperText={ !isNewFilterTagNameValid && "要素名が不正です" }
                                       value={ newFilterTagName }
                                       onChange={ onNewFilterTagNameChange }
                                       error={ !isNewFilterTagNameValid }
                                       onKeyDown={ (e) => {
                                           // Enter key
                                           if (e.keyCode === 13) {
                                               onAddNewFilterTagName();
                                           } } } />
                            <Button className={ classes.newChipButton } variant="contained" color="default" size="small"
                                    onClick={ onAddNewFilterTagName }>
                              追加
                            </Button>
                          </div>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <Typography className={ classes.subheading } component="h3">もしくは&nbsp;&nbsp;以下の属性を持つ要素</Typography>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <ul className={ classes.chipsContainer }>
                            { filterAttributes && filterAttributes.map((data) => {
                                  return (
                                      <li key={ data.key }>
                                        <Chip className={ classes.chip } color="default" size="small"
                                              label={ data.label }
                                              onDelete={ onDeleteFilterAttributesChip(data) } />
                                      </li>
                                  );
                            }) }
                          </ul>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <div className={ classes.newChipContainer }>
                            <TextField className={ classes.newChipTextfield } variant="outlined" size="small"
                                       label="属性を追加"
                                       name="newFilterAttributesTextfield"
                                       helperText={ !isNewFilterAttributesValid && "属性名が不正です" }
                                       value={ newFilterAttributes }
                                       onChange={ onNewFilterAttributesChange }
                                       error={ !isNewFilterAttributesValid }
                                       onKeyDown={ (e) => {
                                           // Enter key
                                           if (e.keyCode === 13) {
                                               onAddNewFilterAttributes();
                                           } } } />
                            <Button className={ classes.newChipButton } variant="contained" color="default" size="small"
                                    onClick={ onAddNewFilterAttributes }>
                              追加
                            </Button>
                          </div>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <Typography className={ classes.subheading } component="h3">このうち&nbsp;&nbsp;以下の階層にある要素をデータ収集の対象とする</Typography>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <div className={ classes.sliderContainer }>
                            <Slider className={ classes.slider } track="normal"
                                    value={ adoptRange ? adoptRange[0] : 0 } min={ 0 } max={ 3 }
                                    onChange={ onLeafAdoptSliderChange }
                                    marks={ leafAdoptSliderMarks } step={ 1 }
                                    getAriaValueText={ getLeafAdoptSliderValueText } valueLabelFormat={ getLeafAdoptSliderValueText }
                                    valueLabelDisplay="on" aria-labelledby="leaf-adopt-range-slider" />
                            <Slider className={ classes.slider } track="inverted"
                                    value={ adoptRange ? 3 - adoptRange[1] : 3 } min={ 0 } max={ 3 }
                                    onChange={ onRootAdoptSliderChange }
                                    marks={ rootAdoptSliderMarks } step={ 1 }
                                    getAriaValueText={ getRootAdoptSliderValueText } valueLabelFormat={ getRootAdoptSliderValueText }
                                    valueLabelDisplay="on" aria-labelledby="root-adopt-range-slider" />
                          </div>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
                <Grid item xs={ 12 }>
                  <Accordion defaultExpanded={ true }>
                    <AccordionSummary expandIcon={ <ExpandMoreIcon /> }
                                      aria-controls="configs-panel-2-content"
                                      id="configs-panel-2-header">
                      <Typography className={ classes.heading } component="h2">要素から収集するデータ</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={ 2 }>
                        <Grid item xs={ 12 }>
                          <Typography className={ classes.subheading } component="h3">全般</Typography>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <Typography className={ classes.subheading } component="h3">要素ごとのデータ</Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </div>
          </div>
        </Dialog>
    );
};

export default ConfigsView;
