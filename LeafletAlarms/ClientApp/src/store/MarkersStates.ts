import { Action, Reducer } from "redux";
import { ApiRootString, AppThunkAction } from "./";
import { BoundBox, IFigures, Marker } from "./Marker";
// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface MarkersState {
  isLoading: boolean;
  markers: IFigures;
  box: BoundBox;
  isChanging?: number;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestMarkersAction {
  type: "REQUEST_MARKERS";
  box: BoundBox;
}

interface ReceiveMarkersAction {
  type: "RECEIVE_MARKERS";
  box: BoundBox;
  markers: IFigures;
}

interface PostingMarkerAction {
  type: "POSTING_MARKERS";
  markers: IFigures;
}

interface PostedMarkerAction {
  type: "POSTED_MARKERS";
  markers: IFigures;
  success: boolean;
}

interface DeletingMarkerAction {
  type: "DELETING_MARKERS";
  ids_to_delete: string[];
}

interface DeletedMarkerAction {
  type: "DELETED_MARKERS";
  deleted_ids: string[];
  success: boolean;
}

interface GotMarkersByIdsAction {
  type: "GOT_MARKERS_BY_IDS";
  markers: IFigures;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
  | RequestMarkersAction
  | ReceiveMarkersAction
  | PostingMarkerAction
  | PostedMarkerAction
  | DeletingMarkerAction
  | DeletedMarkerAction
  | GotMarkersByIdsAction
  ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  requestMarkers: (box: BoundBox): AppThunkAction<KnownAction> => (
    dispatch,
    getState
  ) => {
    // Only load data if it's something we don't already have (and are not already loading)
    const appState = getState();

    if (
      appState &&
      appState.markersStates &&
      box !== appState.markersStates.box
    ) {

      let body = JSON.stringify(box);
      var request = ApiRootString + "/GetByBox";

      var fetched = fetch(request, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: body
      });

      fetched
        .then(response => {
          if (!response.ok) throw response.statusText;
          var json = response.json();
          return json as Promise<IFigures>;
        })
        .then(data => {
          dispatch({ type: "RECEIVE_MARKERS", box: box, markers: data });
        })
        .catch((error) => {
          const emtyMarkers = {} as IFigures;
          dispatch({ type: "RECEIVE_MARKERS", box: box, markers: emtyMarkers });
        });

      dispatch({ type: "REQUEST_MARKERS", box: box });
    }
  },

  addTracks: (markers: IFigures): AppThunkAction<KnownAction> => (
    dispatch,
    getState
  ) => {
    //let marker: Marker = {} as Marker;

    // Send data to the backend via POST
    let body = JSON.stringify(markers);

    var request = ApiRootString + "/AddTracks";

    var fetched = fetch(request, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: body
    });

    console.log("posted:", fetched);

    fetched.then(response => response.json()).then(data => {
      let m: IFigures = data as IFigures;
      dispatch({ type: "POSTED_MARKERS", success: true, markers: m });
    });

    dispatch({ type: "POSTING_MARKERS", markers: markers });
  },

  deleteMarker: (ids: string[]): AppThunkAction<KnownAction> => (
    dispatch,
    getState
  ) => {

    let body = JSON.stringify(ids);

    // Send data to the backend via DELETE

    var fetched = fetch(ApiRootString, {
      method: "DELETE",
      headers: { 'Content-type': 'application/json' },
      body: body
    });

    console.log("deleted:", fetched);

    fetched.then(response => response.json()).then(data => {
      let deleted_ids: string[] = data as string[];
      dispatch({ type: "DELETED_MARKERS", success: true, deleted_ids: deleted_ids });
    });

    dispatch({ type: "DELETING_MARKERS", ids_to_delete: ids });
  },

  requestMarkersByIds: (ids: string[]): AppThunkAction<KnownAction> => (
    dispatch,
    getState
  ) => {
    // Only load data if it's something we don't already have (and are not already loading)
    const appState = getState();

    if (
      appState &&
      appState.markersStates
    ) {

      let body = JSON.stringify(ids);
      var request = ApiRootString + "/GetByIds";

      var fetched = fetch(request, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: body
      });

      fetched
        .then(response => {
          if (!response.ok) throw response.statusText;
          var json = response.json();
          return json as Promise<IFigures>;
        })
        .then(data => {
          dispatch({ type: "GOT_MARKERS_BY_IDS", markers: data });
        })
        .catch((error) => {
          const emtyMarkers = {} as IFigures;
          //dispatch({ type: "RECEIVE_MARKERS", box: box, markers: emtyMarkers });
        });
    }
  },
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: MarkersState = {
  markers: null,
  isLoading: false,
  box: null,
  isChanging: 0
};

export const reducer: Reducer<MarkersState> = (
  state: MarkersState | undefined,
  incomingAction: Action
): MarkersState => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;

  switch (action.type) {
    case "REQUEST_MARKERS":
      return {
        ...state,
        box: action.box,
        markers: state.markers,
        isLoading: true
      };
    case "RECEIVE_MARKERS":
      // Only accept the incoming data if it matches the most recent request. This ensures we correctly
      // handle out-of-order responses.
      if (action.box === state.box) {
        return {
          ...state,
          box: action.box,
          markers: action.markers,
          isLoading: false
        };
      }
      break;

    case "POSTING_MARKERS":
      return {
        ...state,
        box: state.box,
        markers: state.markers,
        isLoading: true
      };
    case "POSTED_MARKERS":
      {
        let deleted_ids = action.markers.circles.map(item => item.id);
        deleted_ids = deleted_ids.concat(action.markers.polygons.map(item => item.id));
        deleted_ids = deleted_ids.concat(action.markers.polylines.map(item => item.id));  

        var cur_markersLeft: IFigures =
        {
          circles: state.markers.circles.filter(item => !(deleted_ids.includes(item.id))),
          polygons: state.markers.polygons.filter(item => !(deleted_ids.includes(item.id))),
          polylines: state.markers.polylines.filter(item => !(deleted_ids.includes(item.id)))
        };

        var cur_markers: IFigures =
        {
          circles: cur_markersLeft.circles.concat(action.markers.circles),
          polygons: cur_markersLeft.polygons.concat(action.markers.polygons),
          polylines: cur_markersLeft.polylines.concat(action.markers.polylines)
        };

        return {
          ...state,
          markers: cur_markers,
          isLoading: false,
          isChanging: state.isChanging + 1
        };
      }

    case "DELETING_MARKERS":
      return {
        ...state,
        isLoading: true
      };
    case "DELETED_MARKERS":
      {
        var cur_markers: IFigures =
        {
          circles: state.markers.circles.filter(item => !(action.deleted_ids.includes(item.id))),
          polygons: state.markers.polygons.filter(item => !(action.deleted_ids.includes(item.id))),
          polylines: state.markers.polylines.filter(item => !(action.deleted_ids.includes(item.id)))
        };
        
        return {
          ...state,
          markers: cur_markers,
          isLoading: false,
          isChanging: state.isChanging + 1
        };
      }

    case "GOT_MARKERS_BY_IDS":
      var cur_markers: IFigures = action.markers;

      state.markers.circles.forEach(element => {
        const itemIndex = cur_markers.circles.findIndex(o => o.id === element.id);
        if (itemIndex < 0) {
          cur_markers.circles.push(element);
        }
      });

      state.markers.polygons.forEach(element => {
        const itemIndex = cur_markers.polygons.findIndex(o => o.id === element.id);
        if (itemIndex < 0) {
          cur_markers.polygons.push(element);
        }
      });

      state.markers.polylines.forEach(element => {
        const itemIndex = cur_markers.polylines.findIndex(o => o.id === element.id);
        if (itemIndex < 0) {
          cur_markers.polylines.push(element);
        }
      });

      return {
        ...state,
        markers: cur_markers,
        isLoading: false,
        isChanging: state.isChanging + 1
      };
  }

  return state;
};
