# @ngx-translate/multi-http-loader

A loader for [ngx-translate](https://github.com/ngx-translate/core) that loads translations using http.

[![npm version](https://img.shields.io/npm/v/ngx-translate-multi-http-loader.svg)](https://www.npmjs.com/package/ngx-translate-multi-http-loader) ![NPM](https://img.shields.io/npm/l/ngx-translate-multi-http-loader) ![npm bundle size](https://img.shields.io/bundlephobia/min/ngx-translate-multi-http-loader)
![npm](https://img.shields.io/npm/dm/ngx-translate-multi-http-loader)

Angular 14 example: https://stackblitz.com/edit/ngx-translate-multi-http-loader-sample-2clau3?file=src/app/app.module.ts

Angular 6 example: https://stackblitz.com/edit/ngx-translate-multi-http-loader-sample

Get the complete changelog here: https://github.com/rbalet/ngx-translate-multi-http-loader/releases

* [Installation](#installation)
* [Usage](#usage)
* [Error & BugFix](#possible-error--bugfix)

## breaking change: v9.0.0
* This library is now using `httpBackend` instead of the `httpClient`, to avoid being delayed by interceptor, which was creating errors while loading.
* From the v9, the library will only be using a list of `string[]` so `prefix` & `suffix` aren't needed anymore and `.json` gonna be the default suffix.

## Installation

We assume that you already installed [ngx-translate](https://github.com/ngx-translate/core).

Now you need to install the npm module for `MultiTranslateHttpLoader`:

```sh
npm install ngx-translate-multi-http-loader
```

Choose the version corresponding to your Angular version:

 | Angular | @ngx-translate/core | ngx-translate-multi-http-loader |
 | ------- | ------------------- | ------------------------------- |
 | >= 16   | 15.x+               | >= 15.x+                        |
 | 15      | 14.x+               | 9.x+                            |
 | 14      | 14.x+               | 8.x+                            |
 | 13      | 14.x+               | 7.x+                            |
 | 6       | 10.x+               | 1.x+                            |

## Usage
_The `MultiTranslateHttpLoader` uses HttpBackend to load translations, therefore :_
1. Create and export a new `HttpLoaderFactory` function
2. Import the `HttpClientModule` from `@angular/common/http` 
3. Setup the `TranslateModule` to use the `MultiTranslateHttpLoader`

```typescript
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HttpBackend} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import {AppComponent} from './app';

// AoT requires an exported function for factories
export function HttpLoaderFactory(_httpBackend: HttpBackend) {
    return new MultiTranslateHttpLoader(_httpBackend, ['/assets/i18n/core/', '/assets/i18n/vendors/']); // /i18n/core/ on angular >= v18 with the new public logic
}

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpBackend]
            }
        })
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

The `MultiTranslateHttpLoader` takes a list of `(string | TranslationResource)[]`. 

### String[]
For example `['/assets/i18n/core/', '/assets/i18n/vendors/']`,   
will load your translations files for the lang "en" from : `/assets/i18n/core/en.json` and `/assets/i18n/vendors/en.json`

### Custom suffix
**For now this loader only support the `json` format.**

Instead of an array of `string[]`,  
you may pass a list of parameters:
- `prefix: string = '/assets/i18n/'`
- `suffix: string = '.json'`
- `optional: boolean = true`

```typescript
export function HttpLoaderFactory(_httpBackend: HttpBackend) {
    return new MultiTranslateHttpLoader(_httpBackend, [
        {prefix: './assets/i18n/core/', suffix: '.json'},
        {prefix: './assets/i18n/vendors/'}, // , "suffix: '.json'" being the default value
        {prefix: './assets/i18n/non-existent/', optional: true}, // Wont create any log
    ]);
}
```

The loader will merge all translation files from the server


## Possible error & Bugfix

### values.at is not a function
1. Install `core-js`
2. In `polyfills.ts`, add `import 'core-js/modules/es.array.at'`


## Authors and acknowledgment
* maintainer [Raphaël Balet](https://github.com/rbalet) 
* Former maintainer [Dennis Keil](https://github.com/denniske) 
* 
[![BuyMeACoffee](https://www.buymeacoffee.com/assets/img/custom_images/purple_img.png)](https://www.buymeacoffee.com/widness)
