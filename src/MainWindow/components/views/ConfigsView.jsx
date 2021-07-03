// System
import React, { useState, useEffect } from 'react';
//// Material-UI
import { ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Toolbar, Grid, Typography, Tooltip } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@material-ui/core';
import { Chip, Slider } from '@material-ui/core';
import { Accordion, AccordionSummary, AccordionDetails, AccordionActions, Divider } from '@material-ui/core';
import { IconButton, Button, TextField } from '@material-ui/core';
import { FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

// User
import { CustomColorPalette, useStyles } from './ConfigsViewStyles';
import { ConfigsProvider, useConfigsContext } from '../../contexts/ConfigsContext.jsx';


// Transition for opening dialogs
const DialogTransition = React.forwardRef((props, ref) => {
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
    const [ isConfigsDialogOpen, setIsConfigsDialogOpen ] = useState(false);
    const [ isAdoptRangeHelpDialogOpen, setIsAdoptRangeHelpDialogOpen ] = useState(false);
    // Configs (local state)
    const [ filterTagNames, setFilterTagNames ] = useState(null);
    const [ filterAttributes, setFilterAttributes ] = useState(null);
    const [ adoptRange, setAdoptRange ] = useState(null);
    const [ generalDataCollection, setGeneralDataCollection ] = useState(null);
    const [ collectAttributes, setCollectAttributes ] = useState(null);
    // Input
    const [newFilterTagName, setNewFilterTagName] = useState("");
    const [isNewFilterTagNameValid, setIsNewFilterTagNameValid] = useState(true);
    const [newFilterAttribute, setNewFilterAttribute] = useState("");
    const [isNewFilterAttributeValid, setIsNewFilterAttributeValid] = useState(true);
    const [newCollectAttribute, setNewCollectAttribute] = useState("");
    const [isNewCollectAttributeValid, setIsNewCollectAttributeValid] = useState(true);


    // React Hooks Context
    // Configs (global context)
    const { configs, setConfigs } = useConfigsContext();


    // React Hooks Effect
    // "open" property Effect
    useEffect(() => {
        setIsConfigsDialogOpen(props.open);
        if (props.open) {
            // Filter TagNames
            const filterTagNamesForChips = [];
            for (let i = 0; i < configs.filterTagNames.length; i++) {
                filterTagNamesForChips.push({ key: i, label: configs.filterTagNames[i] });
            }
            setFilterTagNames(filterTagNamesForChips);
            // Filter Attributes
            const filterAttributesForChips = [];
            for (let i = 0; i < configs.filterAttributes.length; i++) {
                filterAttributesForChips.push({ key: i, label: configs.filterAttributes[i] });
            }
            setFilterAttributes(filterAttributesForChips);
            // Adopt Range
            const adoptRangeForSlider = [configs.adoptRange.leaf, configs.adoptRange.root];
            setAdoptRange(adoptRangeForSlider);
            // General Data Collection
            setGeneralDataCollection(configs.generalDataCollection);
            // Element Data Collectrion (Attributes)
            const collectAttributesForChips = [];
            collectAttributesForChips.push({ key: 0, label: "tagName" });
            for (let i = 0; i < configs.elementDataCollection.attributes.length; i++) {
                collectAttributesForChips.push({ key: i + 1, label: configs.elementDataCollection.attributes[i] });
            }
            setCollectAttributes(collectAttributesForChips);
        }
    }, [props.open]);


    // React Event onDeletes
    const onDeleteFilterTagNameChip = (chipToDelete) => () => {
        setFilterTagNames((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
    };
    const onDeleteFilterAttributeChip = (chipToDelete) => () => {
        setFilterAttributes((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
    };
    const onDeleteCollectAttributeChip = (chipToDelete) => () => {
        setCollectAttributes((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
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
        const collectAttributesArray = [];
        for (let i = 1; i < collectAttributes.length; i++) {
            collectAttributesArray.push(collectAttributes[i].label);
        }
        setConfigs({
            // Initial Configs
            filterTagNames: filterTagNamesArray,
            filterAttributes: filterAttributesArray,
            adoptRange: {
                leaf: adoptRange[0],
                root: adoptRange[1]
            },
            generalDataCollection: generalDataCollection,
            elementDataCollection: {
                tagName: true, // Always true
                attributes: collectAttributesArray
            }
        });
        props.onClose();
    };
    const onOpenAdoptRangeHelpDialog = () => {
        setIsAdoptRangeHelpDialogOpen(true);
    };
    const onCloseAdoptRangeHelpDialog = () => {
        setIsAdoptRangeHelpDialogOpen(false);
    };
    const onAddNewFilterTagName = () => {
        if (isNewFilterTagNameValid) {
            setFilterTagNames([...filterTagNames, { key: filterTagNames.length, label: newFilterTagName }]);
        }
        setNewFilterTagName("");
        setIsNewFilterTagNameValid(true);
    };
    const onAddNewFilterAttribute = () => {
        if (isNewFilterAttributeValid) {
            setFilterAttributes([...filterAttributes, { key: filterAttributes.length, label: newFilterAttribute }]);
        }
        setNewFilterAttribute("");
        setIsNewFilterAttributeValid(true);
    };
    const onAddNewCollectAttribute = () => {
        if (isNewCollectAttributeValid) {
            setCollectAttributes([...collectAttributes, { key: collectAttributes.length, label: newCollectAttribute }]);
        }
        setNewCollectAttribute("");
        setIsNewCollectAttributeValid(true);
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
    const onNewFilterAttributeChange = (event) => {
        const name = event.target.value;
        setNewFilterAttribute(name);
        // If Name Has Space(s)
        if (name.indexOf(' ') >= 0) {
            setIsNewFilterAttributeValid(false);
            return;
        }
        // If Exists
        for (let i = 0; i < filterAttributes.length; i++) {
            if (filterAttributes[i].label === name) {
                setIsNewFilterAttributeValid(false);
                return;
            }
        }
        // If Not Alphabet or Numbers
        if (/^[a-zA-Z0-9-]*$/.test(name) === false) {
            setIsNewFilterAttributeValid(false);
            return;
        }
        // If Starts with a Number
        if (/^[0-9][a-zA-Z0-9-]*$/.test(name) === true) {
            setIsNewFilterAttributeValid(false);
            return;
        }
        setIsNewFilterAttributeValid(true);
    };
    const onNewCollectAttributeChange = (event) => {
        const name = event.target.value;
        setNewCollectAttribute(name);
        // If Name Has Space(s)
        if (name.indexOf(' ') >= 0) {
            setIsNewCollectAttributeValid(false);
            return;
        }
        // If Exists
        for (let i = 0; i < collectAttributes.length; i++) {
            if (collectAttributes[i].label === name) {
                setIsNewCollectAttributeValid(false);
                return;
            }
        }
        // If Not Alphabet or Numbers
        if (/^[a-zA-Z0-9-]*$/.test(name) === false) {
            setIsNewCollectAttributeValid(false);
            return;
        }
        // If Starts with a Number
        if (/^[0-9][a-zA-Z0-9-]*$/.test(name) === true) {
            setIsNewCollectAttributeValid(false);
            return;
        }
        setIsNewCollectAttributeValid(true);
    };
    const onGeneralDataCollectionCheckboxesChange = (event) => {
        setGeneralDataCollection({ ...generalDataCollection, [event.target.name]: event.target.checked });
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
        <Dialog fullScreen open={ isConfigsDialogOpen } onClose={ props.onClose }
                TransitionComponent={ DialogTransition }>
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
                      <Typography className={ classes.heading } component="h2">データ収集の対象</Typography>
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
                                              onDelete={ onDeleteFilterTagNameChip(data) } />
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
                            <Button className={ classes.newChipButton } variant="contained" color="primary" size="small"
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
                                              onDelete={ onDeleteFilterAttributeChip(data) } />
                                      </li>
                                  );
                            }) }
                          </ul>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <div className={ classes.newChipContainer }>
                            <TextField className={ classes.newChipTextfield } variant="outlined" size="small"
                                       label="属性を追加"
                                       name="newFilterAttributeTextfield"
                                       helperText={ !isNewFilterAttributeValid && "属性名が不正です" }
                                       value={ newFilterAttribute }
                                       onChange={ onNewFilterAttributeChange }
                                       error={ !isNewFilterAttributeValid }
                                       onKeyDown={ (e) => {
                                           // Enter key
                                           if (e.keyCode === 13) {
                                               onAddNewFilterAttribute();
                                           } } } />
                            <Button className={ classes.newChipButton } variant="contained" color="primary" size="small"
                                    onClick={ onAddNewFilterAttribute }>
                              追加
                            </Button>
                          </div>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <Typography className={ classes.wrapIconSubheading } component="h3">
                            このうち&nbsp;&nbsp;以下の階層にある要素をデータ収集の対象とする
                            <IconButton className={ classes.helpIcon } color="default" size="small"
                                        onClick={ onOpenAdoptRangeHelpDialog }
                                        aria-label="delete">
                              <HelpOutlineIcon />
                            </IconButton>
                          </Typography>
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
        <Typography className={ classes.heading } component="h2">対象から収集するデータ</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={ 2 }>
                        <Grid item xs={ 12 }>
                          <Typography className={ classes.subheading } component="h3">全般</Typography>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <FormGroup row className={ classes.checkboxesContainer }>
                            <FormControlLabel disabled
                                              control={ <Checkbox name="timestamp" size="small"
                                                                  checked /> }
                                              label="Timestamp" />
                            <FormControlLabel control={ <Checkbox name="coordinates" size="small"
                                                                  checked={ generalDataCollection ? generalDataCollection.coordinates : false }
                                                                  onChange={ onGeneralDataCollectionCheckboxesChange } /> }
                                              label="Coordinates" />
                            <FormControlLabel control={ <Checkbox name="overlapAll" size="small"
                                                                  checked={ generalDataCollection ? generalDataCollection.overlapAll : false }
                                                                  onChange={ onGeneralDataCollectionCheckboxesChange } /> }
                                              label="Overlap(All)" />
                            <FormControlLabel control={ <Checkbox name="overlapFiltered" size="small"
                                                                  checked={ generalDataCollection ? generalDataCollection.overlapFiltered : false }
                                                                  onChange={ onGeneralDataCollectionCheckboxesChange } /> }
                                              label="Overlap(Filtered)" />
                          </FormGroup>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <Typography className={ classes.subheading } component="h3">要素から取得するデータ</Typography>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <ul className={ classes.chipsContainer }>
                            { collectAttributes && collectAttributes.map((data) => {
                                  return (
                                      <li key={ data.key }>
                                        <Chip className={ classes.chip } color="default" size="small"
                                              label={ data.label } disabled={ (data.label === "tagName" ) ? true : false }
                                              onDelete={ (data.label === "tagName" ) ? undefined : onDeleteCollectAttributeChip(data) } />
                                      </li>
                                  );
                            }) }
                          </ul>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <div className={ classes.newChipContainer }>
                            <TextField className={ classes.newChipTextfield } variant="outlined" size="small"
                                       label="属性を追加"
                                       name="newCollectAttributeTextfield"
                                       helperText={ !isNewCollectAttributeValid && "属性名が不正です" }
                                       value={ newCollectAttribute }
                                       onChange={ onNewCollectAttributeChange }
                                       error={ !isNewCollectAttributeValid }
                                       onKeyDown={ (e) => {
                                           // Enter key
                                           if (e.keyCode === 13) {
                                               onAddNewCollectAttribute();
                                           } } } />
                            <Button className={ classes.newChipButton } variant="contained" color="primary" size="small"
                                    onClick={ onAddNewCollectAttribute }>
                              追加
                            </Button>
                          </div>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
              </Grid>
              </Grid>
          </div>
          <Dialog open={ isAdoptRangeHelpDialogOpen } onClose={ onCloseAdoptRangeHelpDialog }
                  TransitionComponent={ DialogTransition } keepMounted
                  aria-labelledby="adopt-range-help-dialog-title"
                  aria-describedby="adopt-range-help-dialog-description">
            <DialogTitle id="adopt-range-help-dialog-title">
              データ収集の対象となる要素の階層について
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="adopt-range-help-dialog-description">
                指定した階層まで要素が存在しない場合には、要素から取得したデータは空となります。<br/>
                また、子要素側で指定した階層の要素と、親要素側で指定した階層の要素が重複した場合には、双方に同じデータが記録されます。
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={ onCloseAdoptRangeHelpDialog } color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
          </div>
        </Dialog>
    );
};

export default ConfigsView;
