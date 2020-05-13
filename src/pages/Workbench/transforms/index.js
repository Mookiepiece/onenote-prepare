import React, { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';

import {
    PlusCircleOutlined,
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    FontColorsOutlined,
    BgColorsOutlined,
    StrikethroughOutlined
} from '@ant-design/icons';

import Input from '@/components/Input';
import Button from "@/components/MkButton";
import { Switch, CheckboxButton } from '@/components/Switch';
import Dialog from "@/components/Dialog";
import AsideDialog from "@/components/Dialog/asideDialog";

import './style.scss';

import Children from './utils';
import { alt } from '@/utils';
import { matchType } from '@/components/Editor/utils';

export const MGet = (i) => {
    let { inputs, ...staticAttrs } = M[i];
    return { ...staticAttrs, inputs: inputs() }
}

export const MFind = (id) => {
    let v = M.find(v=>v.id===id);
    if(v===undefined)
        throw new Error('[pre-onenote] not found')
    let { inputs, ...staticAttrs } = v;
    return { ...staticAttrs, inputs: inputs() }
}

const icons = [
    '<svg t="1589181378073" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="867" width="200" height="200"><path d="M64 325.33v373.33c0 61.86 50.14 112 112 112h672c61.86 0 112-50.14 112-112V325.33c0-61.86-50.14-112-112-112H176c-61.86 0-112 50.15-112 112z" fill="#604D45" p-id="868"></path><path d="M829.33 493.33h-672c-20.62 0-37.33-16.72-37.33-37.33s16.71-37.33 37.33-37.33h672c20.62 0 37.33 16.72 37.33 37.33s-16.71 37.33-37.33 37.33z m37.34 112c0-20.62-16.71-37.33-37.33-37.33h-224c-20.62 0-37.33 16.72-37.33 37.33s16.71 37.33 37.33 37.33h224c20.61 0.01 37.33-16.71 37.33-37.33z" fill="#473A35" p-id="869"></path><path d="M848 474.67H176c-20.62 0-37.33-16.72-37.33-37.33S155.38 400 176 400h672c20.62 0 37.33 16.72 37.33 37.33s-16.71 37.34-37.33 37.34z m37.33 112c0-20.62-16.71-37.33-37.33-37.33H624c-20.62 0-37.33 16.72-37.33 37.33S603.38 624 624 624h224c20.62 0 37.33-16.72 37.33-37.33z" fill="#FFED08" p-id="870"></path></svg>',
    '<svg t="1589181226049" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="847" width="200" height="200"><path d="M571.872 933.13L240.722 535.9c-11.53-13.85-11.53-33.94 0-47.79l331.15-397.23A74.669 74.669 0 0 1 629.362 64h125.44c20.62 0.13 37.23 16.94 37.11 37.56a37.343 37.343 0 0 1-5 18.44l-224 382.3a18.695 18.695 0 0 0 0 18.67l224 382.3c10.31 17.86 4.19 40.69-13.66 51a37.134 37.134 0 0 1-18.44 5h-123.95c-22.6 0.68-44.3-8.94-58.99-26.14z" fill="#43EDCC" p-id="848"></path><path d="M562.542 521.33a18.586 18.586 0 0 1-2.61-9.33h-327.79a37.3 37.3 0 0 0 8.59 23.89l331.15 397.23a74.669 74.669 0 0 0 57.49 26.88h125.44c20.62-0.13 37.23-16.94 37.11-37.56a37.343 37.343 0 0 0-5-18.44l-224.38-382.67z" fill="#3FBCAA" p-id="849"></path></svg>',
    '<svg t="1589181329579" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="992" width="200" height="200"><path d="M451.914 933.48l331.29-397.39c11.53-13.85 11.53-33.96 0-47.81L451.914 90.89A74.692 74.692 0 0 0 394.394 64h-124c-20.63 0.13-37.25 16.95-37.12 37.58a37.38 37.38 0 0 0 5 18.45l224.1 382.46a18.646 18.646 0 0 1 0 18.67l-224.1 382.46c-10.31 17.86-4.19 40.7 13.67 51.02a37.257 37.257 0 0 0 18.45 5.01h124c22.1 0.2 43.16-9.36 57.52-26.17z" fill="#43EDCC" p-id="993"></path><path d="M461.254 521.52l-224.1 382.46c-10.31 17.86-4.19 40.7 13.67 51.02a37.257 37.257 0 0 0 18.45 5.01h124c22.22 0.04 43.3-9.82 57.52-26.89l331.29-397.39a37.307 37.307 0 0 0 8.59-23.9h-327.93c0.38 3.3-0.14 6.64-1.49 9.69z" fill="#3FBCAA" p-id="994"></path></svg>',
    '<svg t="1589181469720" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1209" width="200" height="200"><path d="M134.87 142.05h748.67v748.67H134.87z" fill="#EE8C98" p-id="1210"></path><path d="M755.94 142.05h127.59v748.67H755.94z" fill="#D96478" p-id="1211"></path><path d="M397.23 142.05v285.37l111.97-60.58 111.98 60.58V142.05" fill="#FFFFFF" p-id="1212"></path><path d="M883.54 914.43H134.87c-13.1 0-23.71-10.62-23.71-23.71V142.05c0-13.1 10.62-23.71 23.71-23.71h748.67c13.1 0 23.71 10.62 23.71 23.71v748.67c0 13.1-10.62 23.71-23.71 23.71z m-724.96-47.42h701.24V165.76H158.58v701.25z" fill="#49416F" p-id="1213"></path><path d="M621.18 451.14c-3.88 0-7.76-0.95-11.29-2.86L509.2 393.8l-100.69 54.48a23.713 23.713 0 0 1-35-20.85V142.05c0-13.1 10.62-23.71 23.71-23.71 13.1 0 23.71 10.62 23.71 23.71v245.58l76.97-41.65a23.712 23.712 0 0 1 22.57 0l76.97 41.65V142.05c0-13.1 10.62-23.71 23.71-23.71 13.1 0 23.71 10.62 23.71 23.71v285.38c0 8.36-4.4 16.1-11.58 20.37-3.7 2.22-7.9 3.34-12.1 3.34z" fill="#49416F" p-id="1214"></path></svg>',
    '<svg t="1589181506164" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="852" width="200" height="200"><path d="M815.15 255.14L656.86 96.85A112.004 112.004 0 0 0 577.71 64H288c-61.86 0-112 50.15-112 112v672c0 61.85 50.14 112 112 112h448c61.86 0 112-50.15 112-112V334.29a112.022 112.022 0 0 0-32.85-79.15z" fill="#DCDAC8" p-id="853"></path><path d="M815.15 255.14L656.86 96.85a112.037 112.037 0 0 0-51.52-28.75v238.56H843.9a111.946 111.946 0 0 0-28.75-51.48v-0.04z" fill="#C1BFB0" p-id="854"></path><path d="M815.15 255.14L656.86 96.85a111.994 111.994 0 0 0-32.85-22.4V288h213.55a112.457 112.457 0 0 0-22.41-32.86z" fill="#F2EFDC" p-id="855"></path></svg>',
    '<svg t="1589181506164" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="852" width="200" height="200"><path d="M815.15 255.14L656.86 96.85A112.004 112.004 0 0 0 577.71 64H288c-61.86 0-112 50.15-112 112v672c0 61.85 50.14 112 112 112h448c61.86 0 112-50.15 112-112V334.29a112.022 112.022 0 0 0-32.85-79.15z" fill="#DCDAC8" p-id="853"></path><path d="M815.15 255.14L656.86 96.85a112.037 112.037 0 0 0-51.52-28.75v238.56H843.9a111.946 111.946 0 0 0-28.75-51.48v-0.04z" fill="#C1BFB0" p-id="854"></path><path d="M815.15 255.14L656.86 96.85a111.994 111.994 0 0 0-32.85-22.4V288h213.55a112.457 112.457 0 0 0-22.41-32.86z" fill="#F2EFDC" p-id="855"></path></svg>',
    '<svg t="1589181541518" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="998" width="200" height="200"><path d="M675.03 215.48L549.3 89.75A88.202 88.202 0 0 0 486.81 64H259.6c-48.73 0-88.24 39.51-88.24 88.24v530.17c0 48.73 39.5 88.24 88.23 88.24h353.32c48.73 0 88.24-39.51 88.24-88.24V279.09a88.203 88.203 0 0 0-26.12-63.61z" fill="#5E5C58" p-id="999"></path><path d="M826.51 404.83L700.78 279.1a88.303 88.303 0 0 0-62.49-25.75H411.07c-48.73 0-88.24 39.51-88.24 88.24v530.17c0 48.73 39.5 88.24 88.23 88.24h353.32c48.73 0 88.24-39.51 88.24-88.24V468.44a88.153 88.153 0 0 0-26.11-63.61z" fill="#B79E72" p-id="1000"></path></svg>',
    '<svg t="1589181541518" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="998" width="200" height="200"><path d="M675.03 215.48L549.3 89.75A88.202 88.202 0 0 0 486.81 64H259.6c-48.73 0-88.24 39.51-88.24 88.24v530.17c0 48.73 39.5 88.24 88.23 88.24h353.32c48.73 0 88.24-39.51 88.24-88.24V279.09a88.203 88.203 0 0 0-26.12-63.61z" fill="#5E5C58" p-id="999"></path><path d="M826.51 404.83L700.78 279.1a88.303 88.303 0 0 0-62.49-25.75H411.07c-48.73 0-88.24 39.51-88.24 88.24v530.17c0 48.73 39.5 88.24 88.23 88.24h353.32c48.73 0 88.24-39.51 88.24-88.24V468.44a88.153 88.153 0 0 0-26.11-63.61z" fill="#B79E72" p-id="1000"></path></svg>',
    '<svg t="1589181577444" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1355" width="200" height="200"><path d="M305.136775 833.726324a292.31 293.35 44.999 1 0 414.852308-414.86679 292.31 293.35 44.999 1 0-414.852308 414.86679Z" fill="#D0E2F3" p-id="1356"></path><path d="M554.28 336.37c99.8 50.99 168.95 161.63 168.95 289.92 0 128.3-69.15 238.93-168.95 289.92 142-20.25 251.19-142.32 251.19-289.92 0-147.6-109.19-269.68-251.19-289.92z" fill="#A0C8EA" p-id="1357"></path><path d="M512.57 932.09c-84.69 0-151.03-134.32-151.03-305.8s66.34-305.8 151.03-305.8S663.6 454.81 663.6 626.29s-66.33 305.8-151.03 305.8z m0-585.78c-67.88 0-125.22 128.22-125.22 279.99s57.34 279.99 125.22 279.99S637.79 778.07 637.79 626.3s-57.34-279.99-125.22-279.99z" fill="#49416F" p-id="1358"></path><path d="M512.57 484.43c-84.45 0-162.83-16.22-220.71-45.67a12.893 12.893 0 0 1-6.85-9.24c-0.71-3.98 0.49-8.07 3.24-11.04 57.72-62.28 139.48-97.99 224.32-97.99s166.6 35.72 224.32 97.99a12.91 12.91 0 0 1-3.61 20.28c-57.88 29.45-136.26 45.67-220.71 45.67z m-192.83-61.1c52.14 22.54 121.22 35.28 192.83 35.28s140.69-12.74 192.83-35.28c-51.81-49.15-121.12-77.03-192.83-77.03s-141.02 27.88-192.83 77.03zM512.57 932.09c-84.84 0-166.6-35.72-224.32-97.99a12.91 12.91 0 0 1 3.61-20.28c57.88-29.45 136.26-45.67 220.71-45.67 84.45 0 162.83 16.22 220.71 45.67a12.912 12.912 0 0 1 3.61 20.28c-57.72 62.27-139.48 97.99-224.32 97.99zM319.74 829.25c51.81 49.15 121.12 77.03 192.83 77.03S653.6 878.4 705.4 829.25c-52.14-22.54-121.22-35.28-192.83-35.28s-140.69 12.74-192.83 35.28z" fill="#49416F" p-id="1359"></path><path d="M512.57 932.09c-168.62 0-305.8-137.18-305.8-305.8s137.18-305.8 305.8-305.8 305.8 137.18 305.8 305.8-137.18 305.8-305.8 305.8z m0-585.78c-154.38 0-279.99 125.6-279.99 279.99s125.6 279.99 279.99 279.99 279.99-125.6 279.99-279.99-125.6-279.99-279.99-279.99z" fill="#49416F" p-id="1360"></path><path d="M512.57 932.09c-7.13 0-12.91-5.78-12.91-12.91V333.4c0-7.13 5.78-12.91 12.91-12.91s12.91 5.78 12.91 12.91v585.78c0 7.13-5.78 12.91-12.91 12.91z" fill="#49416F" p-id="1361"></path><path d="M805.47 639.2H219.68c-7.13 0-12.91-5.78-12.91-12.91s5.78-12.91 12.91-12.91h585.78c7.13 0 12.91 5.78 12.91 12.91s-5.77 12.91-12.9 12.91z" fill="#49416F" p-id="1362"></path><path d="M595.63 145.3c-47.08-45.66-121.91-45.66-169 0-40.23 39.01-48.52 100.49-20.08 148.76l104.57 177.46 104.57-177.46c28.47-48.27 20.17-109.75-20.06-148.76z m-84.49 149.51c-34.44 0-62.36-27.92-62.36-62.36s27.92-62.36 62.36-62.36 62.36 27.92 62.36 62.36-27.92 62.36-62.36 62.36z" fill="#EE8C98" p-id="1363"></path><path d="M511.13 484.43c-4.57 0-8.8-2.42-11.12-6.35L395.44 300.62c-31.58-53.6-22.45-121.28 22.21-164.58 25.19-24.43 58.39-37.88 93.48-37.88s68.29 13.45 93.48 37.88c44.66 43.31 53.79 110.98 22.21 164.58L522.26 478.08a12.935 12.935 0 0 1-11.13 6.35z m0-360.66c-27.17 0-54.34 10.26-75.51 30.8-36.08 34.98-43.45 89.65-17.94 132.94l93.45 158.59 93.45-158.59c25.51-43.29 18.13-97.96-17.94-132.94-21.16-20.53-48.34-30.8-75.51-30.8z" fill="#49416F" p-id="1364"></path><path d="M511.13 307.71c-41.5 0-75.27-33.77-75.27-75.27 0-41.5 33.77-75.27 75.27-75.27s75.27 33.77 75.27 75.27c0.01 41.51-33.76 75.27-75.27 75.27z m0-124.72c-27.27 0-49.46 22.19-49.46 49.46s22.19 49.46 49.46 49.46 49.46-22.19 49.46-49.46-22.18-49.46-49.46-49.46z" fill="#49416F" p-id="1365"></path></svg>',
    '<svg t="1589181584029" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1508" width="200" height="200"><path d="M309.583278 715.089837a286.04 287.06 44.999 1 0 405.957059-405.97123 286.04 287.06 44.999 1 0-405.957059 405.97123Z" fill="#D0E2F3" p-id="1509"></path><path d="M553.39 228.4c97.66 49.9 165.33 158.16 165.33 283.71 0 125.55-67.67 233.81-165.33 283.71C692.34 776 799.19 656.54 799.19 512.1c0-144.43-106.85-263.89-245.8-283.7z" fill="#A0C8EA" p-id="1510"></path><path d="M512.57 811.89c-83.18 0-148.33-131.68-148.33-299.78s65.16-299.78 148.33-299.78S660.91 344 660.91 512.1s-65.16 299.79-148.34 299.79z m0-573.23c-66.13 0-121.99 125.22-121.99 273.44s55.87 273.44 121.99 273.44 122-125.21 122-273.44c0-148.22-55.87-273.44-122-273.44z" fill="#49416F" p-id="1511"></path><path d="M512.57 373.82c-82.72 0-159.51-15.89-216.22-44.75a13.145 13.145 0 0 1-6.99-9.43c-0.72-4.06 0.5-8.23 3.31-11.26 56.58-61.05 136.73-96.07 219.9-96.07s163.32 35.01 219.9 96.07c2.81 3.03 4.03 7.2 3.31 11.26-0.72 4.07-3.31 7.55-6.99 9.43-56.71 28.86-133.49 44.75-216.22 44.75z m-187.73-60.49c50.87 21.82 118.07 34.16 187.73 34.16 69.67 0 136.87-12.33 187.73-34.16-50.53-47.65-117.97-74.67-187.73-74.67-69.76 0-137.2 27.01-187.73 74.67zM512.57 811.89c-83.17 0-163.32-35.01-219.9-96.07-2.81-3.03-4.03-7.2-3.31-11.26 0.72-4.07 3.31-7.55 6.99-9.43 56.71-28.85 133.5-44.75 216.22-44.75s159.51 15.89 216.22 44.75c3.68 1.87 6.27 5.36 6.99 9.43 0.72 4.06-0.5 8.23-3.31 11.26-56.57 61.05-136.73 96.07-219.9 96.07zM324.84 710.88c50.53 47.65 117.97 74.67 187.73 74.67 69.76 0 137.2-27.01 187.73-74.67-50.87-21.82-118.07-34.16-187.73-34.16s-136.86 12.34-187.73 34.16z" fill="#49416F" p-id="1512"></path><path d="M512.57 811.89c-165.3 0-299.78-134.48-299.78-299.78 0-165.3 134.48-299.78 299.78-299.78 165.3 0 299.78 134.48 299.78 299.78 0.01 165.29-134.47 299.78-299.78 299.78z m0-573.23c-150.78 0-273.44 122.67-273.44 273.44 0 150.78 122.67 273.44 273.44 273.44S786.02 662.88 786.02 512.1c0-150.77-122.67-273.44-273.45-273.44z" fill="#49416F" p-id="1513"></path><path d="M512.57 811.89c-7.27 0-13.17-5.9-13.17-13.17V225.49c0-7.27 5.9-13.17 13.17-13.17s13.17 5.9 13.17 13.17v573.22c0 7.28-5.89 13.18-13.17 13.18z" fill="#49416F" p-id="1514"></path><path d="M799.19 525.27H225.96c-7.27 0-13.17-5.9-13.17-13.17s5.9-13.17 13.17-13.17h573.22c7.27 0 13.17 5.9 13.17 13.17 0.01 7.28-5.89 13.17-13.16 13.17z" fill="#49416F" p-id="1515"></path><path d="M330.8 523.74c-28.86-27.99-74.74-27.99-103.6 0-24.66 23.91-29.75 61.6-12.31 91.2L279 723.73l64.11-108.79c17.44-29.6 12.35-67.28-12.31-91.2z" fill="#FFFFFF" p-id="1516"></path><path d="M279 736.9c-4.66 0-8.98-2.47-11.35-6.48l-64.11-108.79c-20.6-34.95-14.64-79.09 14.49-107.34 34.19-33.15 87.75-33.15 121.94 0 29.13 28.24 35.08 72.38 14.49 107.34l-64.11 108.79A13.184 13.184 0 0 1 279 736.9z m0-221.09c-15.34 0-30.68 5.8-42.63 17.39-20.37 19.75-24.53 50.61-10.13 75.05L279 697.78l52.76-89.53c14.4-24.44 10.24-55.3-10.13-75.05-11.95-11.59-27.29-17.39-42.63-17.39z" fill="#49416F" p-id="1517"></path><path d="M307.87 569.76c5.34 22.16-14.12 41.62-36.28 36.28-10.42-2.51-18.96-11.05-21.47-21.47-5.34-22.16 14.12-41.62 36.28-36.28 10.42 2.51 18.96 11.05 21.47 21.47z" fill="#49416F" p-id="1518"></path><path d="M212.57 758.85c-3.92 0-7.79-1.74-10.39-5.07C80.33 597.67 94.19 374.19 234.43 233.96c140.24-140.24 363.71-154.1 519.82-32.25 5.73 4.48 6.75 12.75 2.28 18.49-4.47 5.73-12.75 6.75-18.49 2.28-145.64-113.69-354.14-100.75-484.99 30.1-130.85 130.85-143.79 339.35-30.11 484.99 4.48 5.73 3.46 14.01-2.28 18.49-2.4 1.88-5.25 2.79-8.09 2.79zM512.25 905.42c-84.94 0-170.15-27.34-241.35-82.92-5.73-4.48-6.75-12.75-2.28-18.49 4.47-5.73 12.75-6.75 18.49-2.28 145.64 113.68 354.14 100.74 484.99-30.11 130.85-130.85 143.79-339.35 30.11-484.99-4.48-5.73-3.46-14.01 2.28-18.49 5.73-4.48 14.01-3.46 18.49 2.28 121.85 156.11 107.99 379.59-32.25 519.82-76.28 76.28-177.19 115.18-278.48 115.18z" fill="#49416F" p-id="1519"></path><path d="M771.97 309.32c-28.86-27.99-74.74-27.99-103.6 0-24.66 23.91-29.75 61.6-12.31 91.2l64.11 108.79 64.11-108.79c17.43-29.6 12.35-67.28-12.31-91.2z" fill="#EE8C98" p-id="1520"></path><path d="M720.17 522.47c-4.66 0-8.98-2.47-11.35-6.48L644.71 407.2c-20.6-34.95-14.64-79.09 14.49-107.34 34.19-33.15 87.75-33.15 121.93 0 29.13 28.24 35.08 72.38 14.49 107.34l-64.11 108.79a13.146 13.146 0 0 1-11.34 6.48z m0-221.08c-15.34 0-30.68 5.8-42.63 17.39-20.37 19.75-24.53 50.61-10.13 75.05l52.76 89.53 52.76-89.53c14.4-24.44 10.24-55.3-10.13-75.05-11.95-11.59-27.29-17.39-42.63-17.39z" fill="#49416F" p-id="1521"></path><path d="M749.04 355.34c5.34 22.16-14.12 41.62-36.28 36.28-10.42-2.51-18.96-11.05-21.47-21.47-5.34-22.16 14.12-41.62 36.28-36.28 10.42 2.51 18.96 11.05 21.47 21.47z" fill="#49416F" p-id="1522"></path></svg>',
];

export const M = [
    {
        title: "行内文本匹配",
        desc: '匹配行内文本',
        icon: icons[0],
        inType: '',
        outType: 'leaf',

        inputs: _ => ({ value: '' }),

        match: (editor, prevRanges, { value }) => {
            if (!value) return [];
            const children = editor.children;

            const ranges = [];

            Children.iterateArray(children, (el, path, children) => {
                if (matchType('paragraph')(el)) {
                    //匹配过程中pre里面只能有一层span不会出现placeholder
                    const innerText = el.children.reduce((result, leaf) => result + leaf.text, '');

                    const matchResults = [...innerText.matchAll(new RegExp(value, 'g'))];

                    if (matchResults.length) {
                        let resultPointer = 0;
                        let resultIndex = matchResults[resultPointer].index;
                        let resultLength = matchResults[resultPointer][0].length;

                        let count = 0;
                        let anchor, focus;
                        let allRangesWasPushedFlag = false;
                        for (let index = 0; index < el.children.length; index++) {
                            let leafLength = Editor.end(editor, [...path, index]).offset;

                            while (true) {
                                if (!anchor) {
                                    //anchor 必须在下一个node的开头而非本node的结尾 否则会把这个node搭上 不加等号
                                    if (count + leafLength > resultIndex) {
                                        anchor = {
                                            path: [...path, index],
                                            offset: resultIndex - count
                                        };
                                    } else {
                                        break;
                                    }
                                }
                                if (anchor) {
                                    //focus 最好能在node的末尾而非开头 加等号
                                    if (count + leafLength >= resultIndex + resultLength) {
                                        focus = {
                                            path: [...path, index],
                                            offset: resultIndex - count + resultLength
                                        };
                                        ranges.push({ anchor, focus });
                                        anchor = focus = null;
                                        if (++resultPointer < matchResults.length) {
                                            resultIndex = matchResults[resultPointer].index;
                                            resultLength = matchResults[resultPointer][0].length;
                                        } else {
                                            allRangesWasPushedFlag = true;
                                            break;
                                        }
                                    } else {
                                        break;
                                    }
                                }
                            }
                            count += leafLength;
                            if (allRangesWasPushedFlag)
                                break;
                        }
                    }
                    return false;
                } else {
                    return true; //text或非paragraph继续循环，p停止？
                }
            });
            return ranges;
        },

        render({ inputs, onInput, onMatch }) {
            const { value } = inputs;

            return (
                <div className="match-rule-grid" >
                    <span>匹配文本:</span>
                    <Input
                        value={value}
                        onChange={value => onInput({ value }, true)}
                        onFocus={onMatch}
                    />
                </div>
            )
        }
    },
    {
        title: "行首匹配",
        desc: '匹配（以某文本串开头的）行首',
        icon: icons[1],
        inType: '',
        outType: 'leaf',

        inputs: _ => ({ value: '' }),
        match: (editor, prevRanges, { value }) => {
            const children = editor.children;

            const ranges = [];

            if (value === '') {
                Children.iterateArray(children, (el, path, children) => {
                    if (matchType('paragraph')(el)) {
                        let anchor, focus;
                        anchor = focus = { path: [...path, 0], offset: 0 }
                        ranges.push({ anchor, focus });
                    }
                    return true;
                });
            } else {
                Children.iterateArray(children, (el, path, children) => {
                    if (matchType('paragraph')(el)) {
                        const innerText = el.children.reduce((result, leaf) => result + leaf.text, '');
                        if (innerText.startsWith(value)) {
                            let anchor = { path: [...path, 0], offset: 0 }, focus;
                            let len = value.length;
                            let count = 0;

                            for (let index = 0; index < el.children.length; index--) {
                                let leafLength = Editor.end(editor, [...path, index]).offset;
                                if (count + leafLength >= len) {
                                    focus = {
                                        path: [...path, index],
                                        offset: len - count
                                    };
                                    break;
                                }
                                count += leafLength;
                            }

                            ranges.push({ anchor, focus });
                        }
                    }
                    return true;
                });
            }
            return ranges;
        },

        render({ inputs, onInput, onMatch }) {
            const { value } = inputs;

            return (
                <div className="match-rule-grid" >
                    <span>开头限制:</span>
                    <Input value={value} onChange={value => onInput({ value }, true)} onFocus={onMatch} />
                </div>
            )
        }
    },
    {
        title: "行尾匹配",
        desc: '匹配（以某文本串结尾的）行尾',
        icon: icons[2],
        inType: '',
        outType: 'leaf',

        inputs: _ => ({ value: '', }),
        match: (editor, prevRanges, { value }) => {
            const children = editor.children;

            const ranges = [];

            if (value === '') {
                Children.iterateArray(children, (el, path, children) => {
                    if (matchType('paragraph')(el)) {
                        let anchor, focus;
                        anchor = focus = Editor.end(editor, path);
                        ranges.push({ anchor, focus });
                    }
                    return true;
                });
            } else {
                Children.iterateArray(children, (el, path, children) => {
                    if (matchType('paragraph')(el)) {
                        const innerText = el.children.reduce((result, leaf) => result + leaf.text, '');
                        if (innerText.endsWith(value)) {
                            let anchor, focus = Editor.end(editor, path);
                            let len = value.length;
                            let count = 0;

                            for (let index = el.children.length - 1; index >= 0; index--) {
                                let leafLength = Editor.end(editor, [...path, index]).offset;
                                if (count + leafLength >= len) { //反的所以是正的
                                    anchor = {
                                        path: [...path, index],
                                        offset: count - len //反的
                                    };
                                    break;
                                }
                                count += leafLength;
                            }

                            ranges.push({ anchor, focus });
                        }
                    }
                    return true;
                });
            }
            return ranges;
        },

        render({ inputs, onInput, onMatch }) {
            const { value } = inputs;

            return (
                <div className="match-rule-grid">
                    <span>结尾限制:</span>
                    <Input value={value} onChange={value => onInput({ value }, true)} onFocus={onMatch} />
                </div>
            )
        }
    },
    {
        title: "文字样式匹配",
        desc: '筛选具有文字颜色，加粗，斜体等样式的文字',
        icon: icons[3],
        inType: '',
        outType: 'leaf',

        inputs: _ => ({
            bold: [false, true],
            italic: [false, true],
            underline: [false, true],
            strike: [false, true],
            fontColor: [false, true],
            bgColor: [false, true],
        }),
        match: (editor, prevRanges, { bold, italic, underline, strike, fontColor, bgColor }) => {
            const children = editor.children;

            const ranges = [];

            if (!(bold[0] || italic[0] || underline[0] || strike[0] || fontColor[0] || bgColor[0]))
                return [];

            Children.iterateArray(children, (el, path, children) => {
                if (Text.isText(el)) {
                    if (bold[0]) {
                        if (!(el.bold === bold[1] || el.bold === undefined && !bold[1]))  //NOTE: undefined !== false and undefined !== true
                            return false; //NOTE:return 仅仅是表示能不能继续向下循环 //不过这里防止push了
                    }
                    if (italic[0]) {
                        if (!(el.italic === italic[1] || el.italic === undefined && !italic[1]))
                            return false;
                    }
                    if (underline[0]) {
                        if (!(el.underline === underline[1] || el.underline === undefined && !underline[1]))
                            return false;
                    }
                    if (strike[0]) {
                        if (!(el.strike === strike[1] || el.strike === undefined && !strike[1]))
                            return false;
                    }
                    if (fontColor[0]) {
                        if (!(!!el.fontColor === fontColor[1] || el.fontColor === undefined && !fontColor[1]))
                            return false;
                    }
                    if (bgColor[0]) {
                        if (!(!!el.bgColor === bgColor[1] || el.bgColor === undefined && !bgColor[1]))
                            return false;
                    }

                    ranges.push({
                        anchor: { path, offset: 0 },
                        focus: Editor.end(editor, path)
                    });
                }
                return true;
            });

            return ranges;
        },

        render({ inputs, onInput, onMatch }) {
            const { bold, italic, underline, strike, fontColor, bgColor } = inputs;

            const [visible, setVisible] = useState();
            const leafStyles = useMemo(_ => [
                ['bold', BoldOutlined, '粗体', { fontWeight: 'bold' }],
                ['italic', ItalicOutlined, '斜体', { fontStyle: 'italic' }],
                ['underline', UnderlineOutlined, '底线', { textDecoration: 'underline' }],
                ['strike', StrikethroughOutlined, '删除', { textDecoration: 'line-through' }],
                ['fontColor', FontColorsOutlined, '前景', { color: 'var(--blue-5)' }],
                ['bgColor', BgColorsOutlined, '背景', { backgroundColor: 'var(--blue-3)' }]
            ], []);

            return (
                <>
                    <div className="match-rule-grid">
                        <span>选项:</span>
                        <Button onClick={_ => setVisible(true)}><PlusCircleOutlined /></Button>
                    </div>
                    <AsideDialog visible={visible} setVisible={setVisible}>
                        <div className="match-rule-style-match">
                            {
                                leafStyles.map(([name, Icon, text, style]) => {
                                    return (
                                        <div key={name} className={`match-rule-style-match-item`}>
                                            <CheckboxButton
                                                value={inputs[name][0]}
                                                onChange={v => onInput({ [name]: alt.set(inputs[name], 0, v) }, true)}
                                            ><span style={{ ...style, fontSize: 12 }}><Icon />{text}</span></CheckboxButton>
                                            <Switch
                                                value={inputs[name][1]}
                                                onChange={v => onInput({ [name]: alt.set(inputs[name], 1, v) }, true)}
                                                disabled={!inputs[name][0]}
                                                inactiveColor={'var(--purple-5)'}
                                            />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </AsideDialog>
                </>
            )
        }
    },
    {
        title: "空行",
        desc: '-',
        icon: icons[4],
        inType: '',
        outType: 'node',
        inputs: _ => { },
        match: (editor, prevRanges, { }) => {
            const children = editor.children;

            let id = 0;
            const ranges = [];
            Children.iterateArray(children, (el, path) => {
                if (matchType('paragraph')(el)) {
                    if (el.children.length === 1 && el.children[0].text === '') {
                        ranges.push([path, ++id]);
                    }
                }
                return true;
            });
            return ranges;
        },
        render({ onInput }) {
            return (<p onClick={_ => onInput({}, true)}>{'//////////'}</p>)
        }
    },
    {
        title: "空行（粘连）",
        icon: icons[5],
        desc: '-',
        inType: '',
        outType: 'node',
        inputs: _ => { },
        match: (editor, prevRanges, { }) => {
            const children = editor.children;

            let id = 0;
            const ranges = [];
            Children.iterateArray(children, (el, path) => {
                if (matchType('paragraph')(el)) {
                    if (el.children.length === 1 && el.children[0].text === '') {
                        if (sticky(ranges, path)) {
                            ranges.push([path, id]);
                        } else {
                            ranges.push([path, ++id]);
                        }
                    }
                }
                return true;
            });
            return ranges;
        },
        render({ onInput }) {
            return (<p onClick={_ => onInput({}, true)}>{'//////////'}</p>)
        }
    },
    {
        title: "全部行",
        desc: '-',
        icon: icons[6],
        inType: '',
        outType: 'node',
        inputs: _ => { },
        match: (editor, prevRanges, { }) => {
            const iChildren = { children: editor.children };

            let id = 0;
            const ranges = [];
            Children.iterate(iChildren, [], iChildren, (el, path) => {
                if (matchType('paragraph')(el)) {
                    ranges.push([path, ++id]);
                }
                return true;
            });
            return ranges;
        },
        render({ onInput }) {
            return (<p onClick={_ => onInput({}, true)}>{'//////////'}</p>)
        }
    },
    {
        title: "全部行（粘连）",
        desc: '-',
        icon: icons[7],
        inType: '',
        outType: 'node',
        inputs: _ => { },
        match: (editor, prevRanges, { }) => {
            const iChildren = { children: editor.children };

            let id = 0;
            const ranges = [];
            Children.iterate(iChildren, [], iChildren, (el, path) => {
                if (matchType('paragraph')(el)) {
                    if (sticky(ranges, path)) {
                        ranges.push([path, id]);
                    } else {
                        ranges.push([path, ++id]);
                    }
                }
                return true;
            });
            return ranges;
        },
        render({ onInput }) {
            return (<p onClick={_ => onInput({}, true)}>{'//////////'}</p>)
        }
    },
    {
        title: "最外层行（粘连）",
        desc: '-',
        icon: icons[8],
        inType: '',
        outType: 'node',
        inputs: _ => { },
        match: (editor, prevRanges, { }) => {

            let id = 0;
            const ranges = [];
            editor.children.forEach((el, index) => {
                const path = [index];
                if (matchType('paragraph')(el)) {
                    if (sticky(ranges, path)) {
                        ranges.push([path, id]);
                    } else {
                        ranges.push([path, ++id]);
                    }
                }
            });
            return ranges;
        },
        render({ onInput }) {
            return (<p onClick={_ => onInput({}, true)}>{'//////////'}</p>)
        }
    },
    {
        title: "最外层所有（粘连）",
        desc: '-',
        icon: icons[9],
        inType: '',
        outType: 'node',
        inputs: _ => { },
        match: (editor, prevRanges, { }) => {

            let id = 0;
            const ranges = [];
            editor.children.forEach((el, index) => {
                const path = [index];
                if (matchType('paragraph', 'numbered-list', 'bulleted-list', 'table')(el)) {
                    if (sticky(ranges, path)) {
                        ranges.push([path, id]);
                    } else {
                        ranges.push([path, ++id]);
                    }
                }
            });
            return ranges;
        },
        render({ onInput }) {
            return (<p onClick={_ => onInput({}, true)}>{'//////////'}</p>)
        }
    }
].map((v, id) => ({ ...v, id }));

const sticky = (ranges, path) => {
    let lastRange = ranges[ranges.length - 1];
    return lastRange && nextTo(lastRange[0], path);
}

const nextTo = (p0, p1) => {
    if (!p0.length || !p1.length)
        return;

    let _0 = p0.slice(0, -1), _1 = p1.slice(0, -1);
    if (_0.length === _1.length && _0.every((v, i) => v === _1[i])) {
        let $0 = p0[p0.length - 1], $1 = p1[p1.length - 1];
        if ($0 === $1 - 1)
            return true;
    }
    return false;
}
