﻿import * as React from 'react';
import * as L from 'leaflet';
import { useDispatch, useSelector, useStore} from "react-redux";
import * as MarkersStore from '../store/MarkersStates';
import * as GuiStore from '../store/GUIStates';
import { ApplicationState } from '../store';
import { BoundBox, ICircle, IFigures, IPolyline, IPolygon } from '../store/Marker';
import { yellow } from '@mui/material/colors';

import { useCallback, useMemo, useState, useEffect } from 'react'
import {
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
  Circle,
  Polygon,
  Polyline
} from 'react-leaflet'

import { LeafletEvent } from 'leaflet';
import { CircleTool, Figures, PolylineTool, PolygonTool } from '../store/EditStates';
import { ObjectPopup } from './ObjectPopup';
import { PolygonMaker } from './PolygonMaker';
import { PolylineMaker } from './PolylineMaker';
import { CircleMaker } from './CircleMaker';

declare module 'react-redux' {
  interface DefaultRootState extends ApplicationState { }
}

export function LocationMarkers() {

  const dispatch = useDispatch();
  const parentMap = useMap();
  
  useEffect(() => {
    console.log('ComponentDidMount LocationMarkers');
    var bounds: L.LatLngBounds;
    bounds = parentMap.getBounds();
    var boundBox: BoundBox = {
      wn: [bounds.getWest(), bounds.getNorth()],
      es: [bounds.getEast(), bounds.getSouth()],
      zoom: parentMap.getZoom()
    };
    dispatch(MarkersStore.actionCreators.requestMarkers(boundBox));
  }, []);

  const selected_id = useSelector((state) => state?.guiStates?.selected_id);
  const checked_ids = useSelector((state) => state?.guiStates?.checked);
  const selectedTool = useSelector((state) => state.editState.figure);


   const mapEvents = useMapEvents({
      click(e) {
         var ll: L.LatLng = e.latlng as L.LatLng;
      },

       moveend(e: LeafletEvent) {
         var bounds: L.LatLngBounds;
         bounds = e.target.getBounds();
         var boundBox: BoundBox = {
           wn: [bounds.getWest(), bounds.getNorth()],
           es: [bounds.getEast(), bounds.getSouth()],
           zoom: e.target.getZoom()
         };

         dispatch(MarkersStore.actionCreators.requestMarkers(boundBox));

         console.log('Locat  ionMarkers Chaged:', e.target.getBounds(), "->", e.target.getZoom());
       },
        mousemove(e: L.LeafletMouseEvent) {

     }
   });

  

  const eventHandlers = useMemo(
    () => ({
      mouseover() {
        //console.log('cursor', parentMap.getContainer().style.cursor);
      }
    }),
    [],
  )
  
  const polygonChanged = useCallback(
    (polygon: IPolygon, e) => {
      var figures: IFigures = {

      };

      figures.polygons = [polygon];
      dispatch(MarkersStore.actionCreators.sendMarker(figures));

    }, [])

  const polylineChanged = useCallback(
    (figure: IPolyline, e) => {
      var figures: IFigures = {

      };

      figures.polylines = [figure];
      dispatch(MarkersStore.actionCreators.sendMarker(figures));

    }, [])

  const circleChanged = useCallback(
    (figure: ICircle, e) => {
      var figures: IFigures = {

      };

      figures.circles = [figure];
      dispatch(MarkersStore.actionCreators.sendMarker(figures));

    }, [])
  

  const deleteMe = useCallback(
    (marker, e) => {
      console.log(e.target.value);
      //alert('delete ' + marker.name);
      parentMap.closePopup();
      let idsToDelete: string[] = [marker.id];
      dispatch(MarkersStore.actionCreators.deleteMarker(idsToDelete));
      dispatch(GuiStore.actionCreators.selectTreeItem(null));
    }, [])

  const updateBaseMarker = useCallback(
    (marker, e) => {
      dispatch(MarkersStore.actionCreators.updateBaseInfo(marker));
    }, [])

  const markers = useSelector((state) => state?.markersStates?.markers);


  const isChanging = useSelector((state) => state?.markersStates?.isChanging);
  useEffect(
    () => {
      dispatch(GuiStore.actionCreators.requestTreeUpdate());
    }, [isChanging]);

  const colorOptionsUnselected = { color: "green" };
  const colorOptionsSelected = { color: "yellow" };
  const colorOptionsChecked = { color: "blue" };
  const purpleOptions = { color: 'purple' }

  const getColor = (id: string) => {
    let colorOption = colorOptionsUnselected;

    if (checked_ids.indexOf(id) !== -1) {
      colorOption = colorOptionsChecked;
    }

    if (selected_id == id) {
      colorOption = colorOptionsSelected;
    }

    return colorOption;
  }

  return (
    <React.Fragment>
      {
        markers?.circles?.map((marker, index) =>
          <Circle
            key={index}
            center={marker.geometry}
            pathOptions={getColor(marker.id)}
            radius={100}
            eventHandlers={eventHandlers}
          >
            <ObjectPopup marker={marker} deleteMe={deleteMe} updateBaseMarker={updateBaseMarker}>
            </ObjectPopup>
          </Circle>
        )}
      {
        markers?.polygons?.map((marker, index) =>
          <Polygon
            pathOptions={getColor(marker.id)}
            positions={marker.geometry}
            key={index}
          >
            <ObjectPopup marker={marker} deleteMe={deleteMe} updateBaseMarker={updateBaseMarker}>
            </ObjectPopup>
          </Polygon>
        )}

      {
        markers?.polylines?.map((marker, index) =>
          <Polyline
            pathOptions={getColor(marker.id)}
            positions={marker.geometry}
            key={index}
          >
            <ObjectPopup marker={marker} deleteMe={deleteMe} updateBaseMarker={updateBaseMarker}>
            </ObjectPopup>
          </Polyline>
        )}

      {selectedTool == PolygonTool ? <PolygonMaker polygonChanged={polygonChanged} /> : <div />}
      {selectedTool == PolylineTool ? <PolylineMaker figureChanged={polylineChanged} /> : <div />}
      {selectedTool == CircleTool ? <CircleMaker figureChanged={circleChanged} /> : <div />}
    </React.Fragment>
  );
}
