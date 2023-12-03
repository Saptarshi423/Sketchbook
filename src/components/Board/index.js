import { MENU_ITEMS } from "@/constants";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";


import { menuItemClick, actionItemClick } from "@/slice/menuSlice";
import { socket } from "../../../socket";

const Board = () => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const shouldDraw = useRef(false);
  const drawHistory = useRef([])
  const historyPointer = useRef(0)
  const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
  const { color, size } = useSelector((state) => state.toolBox[activeMenuItem]);


  useEffect(()=>{
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if(actionMenuItem === MENU_ITEMS.DOWNLOAD){
      const URL = canvas.toDataURL();
      canvas.style.backgroundColor = 'white';
      const anchor = document.createElement('a');
      anchor.href = URL;
      anchor.download = 'sketh.jpg';
      anchor.click();
    }
    else  if (actionMenuItem === MENU_ITEMS.UNDO || actionMenuItem === MENU_ITEMS.REDO) {
      if(historyPointer.current <  0 && actionMenuItem === MENU_ITEMS.UNDO) historyPointer.current = 0;
      if(historyPointer.current >= 0 && actionMenuItem === MENU_ITEMS.UNDO) historyPointer.current -= 1;
      if(historyPointer.current < drawHistory.current.length - 1 && actionMenuItem === MENU_ITEMS.REDO) historyPointer.current += 1
      const imageData = drawHistory.current[historyPointer.current];
      console.log(imageData)
      // context.putImageData(imageData, 0, 0)
      if(imageData == undefined || !imageData){
        context.fillStyle = "rgb(255, 255, 255)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawHistory.current.push(context.getImageData(0,0,canvas.width, canvas.height));
      }else{
        context.putImageData(imageData, 0, 0);
      }
  }
    dispatch(actionItemClick(null));
  },[actionMenuItem])

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const changeConfig = (color,size) => {
      context.strokeStyle = color;
      context.lineWidth = size;
    };

    const handleChangeConfig = (config) => {
      console.log("config", config)
      changeConfig(config.color, config.size)
    }
    changeConfig(color, size)
    socket.on('changeConfig', handleChangeConfig)

  return () => {
    socket.off('changeConfig', handleChangeConfig)
  }
  }, [color, size, activeMenuItem]);

  // before browser paint.
  useLayoutEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const beginPath = (x, y) => {
      context.beginPath()
      context.moveTo(x, y)
    }

    const drawLine = (x, y) => {
      context.lineTo(x, y)
      context.stroke()
    }
    const handleMouseDown = (e) => {
      shouldDraw.current = true
      beginPath(e.clientX, e.clientY);
      socket.emit('beginPath', {x: e.clientX, y: e.clientY})
    }

    const handleMouseMove = (e) => {
      if (!shouldDraw.current) return
      drawLine(e.clientX, e.clientY);
      socket.emit('drawLine', {x: e.clientX, y: e.clientY})
    }

    const handleMouseUp = (e) => {
      shouldDraw.current = false;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      drawHistory.current.push(imageData)
      historyPointer.current = drawHistory.current.length - 1
    }

    const handleBeginPath = (path) => {
      beginPath(path.x, path.y)
    }

    const handleDrawLine = (path) => {
      drawLine(path.x, path.y)
    }

    const handleChangeMenuItem = (item)=>{
      console.log(item)
      dispatch(menuItemClick(item.itemName))
    }

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    socket.on('beginPath', handleBeginPath);
    socket.on('drawLine', handleDrawLine);
    socket.on('changeMenuItem', handleChangeMenuItem);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);

      socket.off('beginPath', handleBeginPath);
      socket.off('drawLine', handleDrawLine);

      socket.off('changeMenuItem', handleChangeMenuItem);
    }
}, [])

  
  return <canvas ref={canvasRef}></canvas>;
};

export default Board;
