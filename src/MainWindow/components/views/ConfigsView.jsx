// System
import React, { useState, useEffect } from 'react';
//// Material-UI
import { ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Toolbar, Grid, Paper, Typography, Tooltip } from '@material-ui/core';
import { Chip } from '@material-ui/core';
import { Accordion, AccordionSummary, AccordionDetails, AccordionActions } from '@material-ui/core';
import { IconButton, Button, TextField } from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// User
import { CustomColorPalette, useStyles } from './ConfigsViewStyles';


// Main Component
const ConfigsView = (props) => {
    // React Hooks State


    // React Hooks Effect


    // React Event onClicks


    // React Event onChanges

    // JSX
    const classes = useStyles();
    return (
        <div className={classes.root}>
          <AppBar className={ classes.appBar } elevation={ 2 } position="sticky">
            <Toolbar className={ classes.toolBar } variant="dense"
                     component="nav" role="navigation" aria-label="分析条件変更画面のメニューバー">
              <Typography className={ classes.toolBarTitle } variant="h6" component="h1" color="inherit">
                分析条件の変更
              </Typography>
              <Button className={ classes.dialogToolBarButton } variant="contained" color="secondary" size="small" disableElevation
                      onClick={ props.saveHandler }
                      startIcon={ <CheckCircleIcon /> }>
                保存
              </Button>
              <Button className={ classes.dialogToolBarButton } variant="contained" color="default" size="small" disableElevation
                      onClick={ props.cancelHandler }
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
                        <Typography className={ classes.subheading } component="h3">以下の属性を持つ要素</Typography>
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
    );
};

export default ConfigsView;
