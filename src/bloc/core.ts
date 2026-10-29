/**
 * Flutter BLoC (Business Logic Component) Pattern for TypeScript / React
 * Implements reactive, decoupled state management modeled after flutter_bloc
 * Ensures code is 100% testable via deterministic Event -> State transitions
 */

export type BlocListenerCallback<S> = (state: S) => void;

export abstract class Bloc<Event, State> {
  private _state: State;
  private _listeners: Set<BlocListenerCallback<State>> = new Set();
  public readonly name: string;

  constructor(initialState: State, name: string = 'Bloc') {
    this._state = initialState;
    this.name = name;
  }

  public get state(): State {
    return this._state;
  }

  public emit(newState: State): void {
    if (this._state === newState) return;
    this._state = newState;
    this._listeners.forEach((listener) => {
      try {
        listener(this._state);
      } catch (err) {
        console.error(`Error in ${this.name} listener:`, err);
      }
    });
  }

  public subscribe(listener: BlocListenerCallback<State>): () => void {
    this._listeners.add(listener);
    // Initial emission on subscribe
    listener(this._state);
    return () => {
      this._listeners.delete(listener);
    };
  }

  public abstract onEvent(event: Event): void | Promise<void>;

  public add(event: Event): void {
    this.onEvent(event);
  }

  public close(): void {
    this._listeners.clear();
  }
}
