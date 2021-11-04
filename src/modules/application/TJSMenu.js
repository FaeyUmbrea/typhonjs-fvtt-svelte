import { outroAndDestroy } from '@typhonjs-fvtt/svelte/util';

import TJSContextMenu      from '../components/contextmenu/TJSContextMenu.svelte';

export default class TJSMenu
{
   /**
    * Stores any active context menu.
    */
   static #contextMenu = void 0;

   static async createContext({ async = false, id = '', x = 0, y = 0, items = [], duration = 400 } = {})
   {
      if (this.#contextMenu !== void 0)
      {
         const menu = this.#contextMenu;
         this.#contextMenu = void 0;
         if (async) { await outroAndDestroy(menu); }
         else { outroAndDestroy(menu); }
      }

      this.#contextMenu = new TJSContextMenu({
         target: document.body,
         intro: true,
         props: { id, x, y, items, duration }
      });

      this.#contextMenu.$on('close', () =>
      {
         if (this.#contextMenu !== void 0)
         {
            const menu = this.#contextMenu;
            this.#contextMenu = void 0;
            if (async) { outroAndDestroy(menu); }
            else { outroAndDestroy(menu); }
         }
      });
   }
}