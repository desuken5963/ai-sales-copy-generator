import '@testing-library/jest-dom'
import { test as base } from '@playwright/test'

// PlaywrightのテストをJestで実行できるようにする
global.test = base
global.expect = expect 