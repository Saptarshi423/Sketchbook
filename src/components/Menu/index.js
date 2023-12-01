import { useDispatch, useSelector } from "react-redux";
import cx from 'classnames';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faEraser, faRotateLeft, faRotateRight, faFileArrowDown } from "@fortawesome/free-solid-svg-icons";
import styles from './index.module.css';

import { MENU_ITEMS } from "@/constants";
import { menuItemClick, actionItemClick } from "@/slice/menuSlice";



const Menu = ()=>{
    const {activeMenuItem, actionMenuItem} = useSelector((state)=> state.menu);
    const dispatch = useDispatch();

    const handleMenuClick = (itemName)=>{
        dispatch(menuItemClick(itemName))
    }

    const handleActionItemClick = (itemName)=>{
        dispatch(actionItemClick(itemName));
    }

    return(
        <div className={styles.menuContainer}>
            <div className={cx(styles.iconWrapper , {[styles.active]: activeMenuItem === MENU_ITEMS.PENCIL})} onClick={()=>{handleMenuClick(MENU_ITEMS.PENCIL)}}>
                <FontAwesomeIcon icon={faPencil} className={styles.icon}/>
            </div>
            <div className={cx(styles.iconWrapper , {[styles.active]: activeMenuItem === MENU_ITEMS.ERASER})} onClick={()=>{handleMenuClick(MENU_ITEMS.ERASER)}}>
                <FontAwesomeIcon icon={faEraser} className={styles.icon}/>
            </div>
            <div className={styles.iconWrapper} onClick={()=>{handleActionItemClick(MENU_ITEMS.UNDO)}}>
                <FontAwesomeIcon icon={faRotateLeft} className={styles.icon}/>
            </div>
            <div className={styles.iconWrapper} onClick={()=>{handleActionItemClick(MENU_ITEMS.REDO)}}>
                <FontAwesomeIcon icon={faRotateRight} className={styles.icon}/>
            </div>
            <div className={styles.iconWrapper} onClick={()=>{handleActionItemClick(MENU_ITEMS.DOWNLOAD)}}>
                <FontAwesomeIcon icon={faFileArrowDown} className={styles.icon}/>
            </div>

        </div>
    )
}

export default Menu;