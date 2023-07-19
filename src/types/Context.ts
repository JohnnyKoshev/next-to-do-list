export interface ContextInterface {
    setTasks?: (value: (((prevState: Task[]) => Task[]) | Task[])) => void;
    tasks?: Task[]
}