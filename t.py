import pyautogui, threading
import asyncio
from pynput.keyboard import Key, Listener

pyautogui.PAUSE = 0.2
script_started = False
on_script = False

def on_press (key):
  if key == Key.enter:
    print('enter')
    start_script()

def on_release(key):
  # 监听释放
  print('{0} release'.format(key))
  if key == Key.esc:
    global on_script
    on_script = False
    print('esc')
    # Stop listener
    exit()
    return False

def start_script ():
  global script_started
  global on_script
  if script_started:
    print('已经开始执行')
    return False
  else:
    script_started = True
    on_script = True
    script()

def script():
  print('script')
  pyautogui.moveTo(100, 200)
  pyautogui.moveTo(100, 300)
  threading.Timer(1, script).start()

with Listener(on_press=on_press, on_release=on_release) as listener:
  listener.join()
