# Socks

Socks is a s(t)ock market application, without the T (as in ``T``aste of a bad UI?).

## Building Socks

This app was initially built following this tutorial: https://www.youtube.com/watch?v=gu4pafNCXng. Several tools and languages were used in its development, including the programming languages:
- Typescript
- Next.JS
- React

and the tools:
- **TradingView**, for its industry-standard stock market widgets
- **ShadCN**, a beautiful components library
- **CodeRabbit**, an AI pull request reviewing tool 

There were several major parts to Socks' development, as described below.

### Part 1: Layout and Header Setup

To cleanly develop Socks' layout so it was reusable and scalable, we incorporated the following during the development of Socks' primary layout and headers setup:
- React's App Router feature, for simpler and scalable page URLs
- A separate `constants.ts` file to detach some style or settings variables for our application from the interface code itself (in considering the 'separation of concerns' principle)

### Part 2: Homepage

Our homepage includes four TradingView stock market widgets. 

The widgets themselves are stored under the `@/components` directory and loaded in through `useTradingViewWidget` (implemeted in file `useTradingViewWidget.tsx`), a React hook for loading embedded `TradingViewWidgets` into application.

Note here that all the components for our website are added under the `@/components` directory first, and then loaded into the specific pages they are used, in order to maximize reusability and reduce repetition.

![readme/homepage.png](readme/homepage.png)