// System
import React, { useState, useEffect } from 'react';
//// Material-UI
import { ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Toolbar, Grid, Paper, Typography, Tooltip } from '@material-ui/core';
import { Dialog, Slide } from '@material-ui/core';
import { Chip } from '@material-ui/core';
import { Accordion, AccordionSummary, AccordionDetails, AccordionActions } from '@material-ui/core';
import { IconButton, Button, TextField } from '@material-ui/core';
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
            setAdoptRange(configs.adoptRange);
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
        setConfigs({
            // Initial Configs
            filterTagNames: ["address", "article", "aside", "footer", "header", "h1", "h2", "h3", "h4", "h5", "h6", "main", "nav", "section"],
            filterAttributes: ["role", "aria-label"],
            adoptRange: {
                start: 1,
                end: 1
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


    // React Event onChanges

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
                <Button className={ classes.dialogToolBarButton } variant="contained" color="secondary" size="small" disableElevation
                        onClick={ onSaveConfigs }
                        startIcon={ <CheckCircleIcon /> }>
                  保存
                </Button>
                <Button className={ classes.dialogToolBarButton } variant="contained" color="default" size="small" disableElevation
                        onClick={ props.onClose }
                        startIcon={ <CancelIcon /> }>
                  キャンセル
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
                                        <Chip className={ classes.chip } color="secondary" size="small"
                                              label={ data.label }
                                              onDelete={ onDeleteFilterTagNamesChip(data) } />
                                      </li>
                                  );
                            }) }
                          </ul>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <Typography className={ classes.subheading } component="h3">以下の属性を持つ要素</Typography>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <ul className={ classes.chipsContainer }>
                            { filterAttributes && filterAttributes.map((data) => {
                                  return (
                                      <li key={ data.key }>
                                        <Chip className={ classes.chip } color="secondary" size="small"
                                              label={ data.label }
                                              onDelete={ onDeleteFilterAttributesChip(data) } />
                                      </li>
                                  );
                            }) }
                          </ul>
                        </Grid>
                        <Grid item xs={ 12 }>
                          <Typography className={ classes.subheading } component="h3">収集する要素の階層</Typography>
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
