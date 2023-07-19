import TaskInterface from "../types/Task";
import {useContext, useRef, useState} from "react";
import {TasksContext} from "@/TasksContext";
import {ContextInterface} from "@/types/Context";
import {nanoid} from "nanoid";

function ColumnHeader({columnName, colors, opacityRate, textStyle}) {
    return (
        <div className={`border-none rounded-3xl column-header ${opacityRate}`}
             style={{backgroundColor: `${colors.textColor}`}}>
            <span className={"dot-style"} style={{backgroundColor: `${colors.dotColor}`}}></span> <span
            className={`${textStyle}`}>{columnName}</span>
        </div>
    )
}

function Task({columnName, colors, task, setTaskContainerRef, setTaskFromChild, columnStatus}) {
    let taskContainer: EventTarget & HTMLDivElement;
    const taskDelBtn = useRef(null);
    const {tasks, setTasks} = useContext(TasksContext);

    const onTaskDelete = () => {
        const newTasksList = tasks.filter((element) => {
            return element.id !== task.id;
        })
        setTasks(newTasksList);
    }
    const onTaskChange = (event) => {
        task.title = event.target.value;
        for (let element of tasks) {
            if (element.id === task.id) {
                element.title = task.title;
            }
        }
        setTasks(tasks);
    }

    return (
        <div className={"task-container shadow"} draggable={true}
             onDragStart={(e) => {
                 e.currentTarget.style.opacity = '0.4';
                 e.dataTransfer.effectAllowed = 'move';
                 e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
                 console.log(e.currentTarget.outerHTML);
                 taskContainer = e.currentTarget;
                 // setTaskContainerRef(taskContainer);
                 setTaskFromChild(task);
             }}
             onDragEnd={(e) => {
                 e.currentTarget.style.opacity = '1';
                 if (task.status !== columnStatus)
                     e.currentTarget.outerHTML = '';
                 console.log('end');
             }}
             onMouseEnter={() => {
                 taskDelBtn.current.classList.remove('hidden');
             }}
             onMouseLeave={() => {
                 taskDelBtn.current.classList.add('hidden');
             }}
           >
            <div className={"task-header"}>
                <span className={"task-text-style"}>
                    <input type="text" defaultValue={`${task.title}`}
                           className={"task-input"} onChange={onTaskChange}/>
                </span>
                <span className={"task-del-btn hidden"} ref={taskDelBtn}
                      onClick={onTaskDelete}>&#xd7;</span>
            </div>
            <ColumnHeader opacityRate={"opacity-70"} columnName={columnName} colors={colors}
                          textStyle={"task-column-style"}/>
        </div>
    )
}


function Column({columnName, colors, status}) {
    const {tasks, setTasks} = useContext<ContextInterface>(TasksContext);
    const [taskContainerRef, setTaskContainerRef] = useState<EventTarget & HTMLDivElement>();
    const [draggableTask, setDraggableTask] = useState();

    const setTaskFromChild = (element) => {
        setDraggableTask(element)
    };
    const onTaskCreate = () => {
        const newTask: TaskInterface = {
            id: nanoid(),
            title: "",
            status,
            createdAt: `${Date.now()}`
        }
        setTasks!([...tasks, newTask]);
        return <Task columnName={columnName} colors={colors} task={newTask}
                     setTaskContainerRef={setTaskContainerRef}
                     setTaskFromChild={setTaskFromChild} columnStatus={status} draggableTask={draggableTask}/>
    }

    return (
        <div className={"column-container"} onClick={() => {
            console.log(draggableTask)
        }}>
            <ColumnHeader columnName={columnName} colors={colors} opacityRate={"opacity-100"}
                          textStyle={"column-text-style"}/>
            <div className={"tasks-list-container"} onDrop={(e) => {
                e.stopPropagation();
                console.log('check1');
                if (draggableTask.status !== status) {
                    if (!taskContainerRef || !draggableTask) return
                    // e.currentTarget.outerHTML = e.currentTarget.outerHTML + draggableElement?.outerHTML;
                    for (let element of tasks) {
                        if (element.id === draggableTask.id) {
                            element.status = status;
                        }
                    }
                    setTasks!(tasks);
                    console.log(tasks);
                    return <Task columnName={columnName} colors={colors} task={draggableTask}
                                 setTaskContainerRef={setTaskContainerRef}
                                 setDraggableTask={(element) => {
                                     setDraggableTask(element)
                                 }} columnStatus={status} draggableTask={draggableTask}/>;
                }
            }}
                 onDragOver={(e) => {
                     e.preventDefault();
                     e.dataTransfer.dropEffect = "move";
                     return false;
                 }}>
                {
                    tasks!.map(task => {
                        if (task.status === status)
                            return <Task key={task.id} columnName={columnName} colors={colors} task={task}
                                         setTaskContainerRef={setTaskContainerRef}
                                         setTaskFromChild={setTaskFromChild} columnStatus={status}/>
                    })
                }

            </div>
            <div className={"add-btn"} onClick={onTaskCreate}>
                <span className={"add-plus-btn"}></span>
                <span className={"add-text-btn"}>New</span>
            </div>
        </div>
    )
}


export default function ColumnsContainer() {
    const [tasks, setTasks] = useState<TaskInterface[]>([]);

    return (
        <main className={"columns-container"}>
            <TasksContext.Provider value={{tasks, setTasks}}>
                <Column status={"backlog"} columnName={"Not Started"}
                        colors={{textColor: "#edeeed", dotColor: "#8e8a89"}}/>
                <Column status={"todo"} columnName={"Planned"} colors={{textColor: "#ffe2be", dotColor: "#cc9633"}}/>
                <Column status={"in progress"} columnName={"In Progress"}
                        colors={{textColor: "#d6e6f6", dotColor: "#6795b0"}}/>
                <Column status={"test"} columnName={"Testing"} colors={{textColor: "#fddfdd", dotColor: "#d96165"}}/>
                <Column status={"done"} columnName={"Done(Closed)"}
                        colors={{textColor: "#def3e5", dotColor: "#6b9975"}}/>
            </TasksContext.Provider>
        </main>
    )
}

