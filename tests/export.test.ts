import {expect,test} from "bun:test";
import {createComposition} from "../lib/dmgly/model";
import {electronConfig} from "../lib/dmgly/export/electron";
test("Electron exports exact icon centers and a resource-backed config",()=>{const d=createComposition();d.app.x=222;const result=electronConfig(d),config=JSON.parse(result.content);expect(config.dmg.contents[0]).toEqual({x:222,y:170,type:"file"});expect(config.dmg.contents[1].path).toBe("/Applications");expect(config.dmg.background.endsWith(result.assets[0])).toBe(true);expect(config.dmg.backgroundColor).toBeUndefined();expect(config.dmg.iconSize).toBe(128);});
import {tauriConfig} from "../lib/dmgly/export/tauri";
test("Tauri uses the nested DMG config with its supported fields",()=>{const d=createComposition(),r=tauriConfig(d),v=JSON.parse(r.content);expect(v.bundle.macOS.dmg.windowSize).toEqual(d.window);expect(v.bundle.macOS.dmg.appPosition).toEqual({x:180,y:170});expect(v.bundle.macOS.dmg.iconSize).toBeUndefined();expect(r.warnings.length).toBe(1);});
