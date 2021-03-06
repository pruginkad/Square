import * as React from 'react';

import { useEffect, useCallback, useState} from 'react';
import { useDispatch, useSelector, useStore } from "react-redux";

import * as TreeStore from '../store/TreeStates';
import * as GuiStore from '../store/GUIStates';
import { ApplicationState } from '../store';
import { TreeMarker, ViewOption } from '../store/Marker';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box } from '@mui/material';


declare module 'react-redux' {
  interface DefaultRootState extends ApplicationState { }
}

export function TreeControl() {

  const dispatch = useDispatch();

  function getTreeItemsByParent(parent_marker_id: string | null)
  {
    dispatch(
      TreeStore.actionCreators.getByParent(parent_marker_id)
    );
  }

  useEffect(() => {
    console.log('ComponentDidMount TreeControl');
    getTreeItemsByParent(null);
  }, []);


  const markers = useSelector((state) => state?.treeStates?.markers);
  const parent_marker_id = useSelector((state) => state?.treeStates?.parent_marker_id);

  // Selected.
  const reduxSelectedId = useSelector((state) => state?.guiStates?.selected_id);

  function selectItem(selected_marker: TreeMarker | null) {

    var selected_id = selected_marker?.id;

    if (selected_id == reduxSelectedId) {
      selected_id = null;
    }
    let option: ViewOption ={
      map_center: [51.5359, -0.19]
    };
    dispatch(GuiStore.actionCreators.selectTreeItem(selected_id, option));
  }

  const handleSelect = useCallback((selected: TreeMarker) => () => {
    selectItem(selected);
  }, [reduxSelectedId]);

    

  // Drill down.
  const drillDown = useCallback((selected_marker: TreeMarker|null) => () => {
    selectItem(null);
    getTreeItemsByParent(selected_marker?.id);
  }, []);

  // Checked.
  const [checked, setChecked] = React.useState([]);
  const handleChecked = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {

    var selected_id = event.target.id;
    const currentIndex = checked.indexOf(selected_id);
    const newChecked = [...checked];

    if (event.target.checked) {
      newChecked.push(selected_id);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);

    dispatch(GuiStore.actionCreators.checkTreeItem(newChecked));
  }, [checked]);

  const requestTreeUpdate = useSelector((state) => state?.guiStates?.requestedTreeUpdate);

  useEffect(() => {
    getTreeItemsByParent(parent_marker_id);
  }, [requestTreeUpdate, parent_marker_id]);

    return (
      <Box sx={{
              width: '100%',
              maxWidth: 460,
              bgcolor: 'background.paper',
            overflow: 'auto',
            height: '100%',
            border: 1
            }}>

        <List>
        {
          markers?.map((marker, index) =>
            <ListItem
              key={marker.id}
              disablePadding
              secondaryAction={
                marker.has_children &&
                <IconButton edge="end" aria-label="drill_down" onClick={drillDown(marker)}>
                  <ChevronRightIcon/>
                </IconButton>
              }
            >
              <ListItemButton selected={reduxSelectedId == marker.id} role = {undefined} onClick={handleSelect(marker)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={checked.indexOf(marker.id) !== -1}
                    tabIndex={-1}
                    disableRipple
                    id={marker.id}
                    onChange={handleChecked}
                  />
                </ListItemIcon>
                <ListItemText id={marker.id} primary={marker.name} />
              </ListItemButton>
          </ListItem>
        )}
          </List>
        </Box>
    );
}