import { Action, Reducer } from 'redux';
import { AppThunkAction } from '.';

// -----------------

export enum Figures {
  Nothing = "No tool",
  Circle = "Circle tool",
  MultiLine = "Multiline tool",
  Poligon = "Poligon tool"
};

export interface EditState {
  figure: Figures;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

export interface SetFigureAction {
  type: 'SET_FIGURE';
  figure: Figures;
}
export interface DecrementCountAction { type: 'DECREMENT_COUNT' }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
export type KnownAction = SetFigureAction | DecrementCountAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  setFigure: (figure: Figures): AppThunkAction<KnownAction> => (dispatch, getState) => {
    dispatch({ type: 'SET_FIGURE', figure: figure });
  },
  decrement: () => ({ type: 'DECREMENT_COUNT' } as DecrementCountAction)
};

const unloadedState: EditState = {
  figure: Object.keys(Figures)[0] as Figures
};
// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<EditState> = (state: EditState | undefined, incomingAction: Action): EditState => {
  if (state === undefined) {
      return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
      case 'SET_FIGURE':
        return { figure: action.figure};
        case 'DECREMENT_COUNT':
        return { figure: state.figure};
        default:
            return state;
    }
};