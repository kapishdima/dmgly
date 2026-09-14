import {expect,test} from "bun:test";
import {createComposition} from "../lib/dmgly/model";
import {electronConfig} from "../lib/dmgly/export/electron";
test("Electron exports exact icon centers and a resource-backed config",()=>{const d=createComposition();d.app.x=222;const result=electronConfig(d),config=JSON.parse(result.content);expect(config.dmg.contents[0]).toEqual({x:222,y:170,type:"file"});expect(config.dmg.contents[1].path).toBe("/Applications");expect(config.dmg.background.endsWith(result.assets[0])).toBe(true);expect(config.dmg.backgroundColor).toBeUndefined();expect(config.dmg.iconSize).toBe(128);});
