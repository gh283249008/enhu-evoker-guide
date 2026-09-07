"""部署前只清理公开副本中的私人绝对路径，研究原件保留不动。"""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
count = 0
for path in (root / 'public' / 'content').iterdir():
    if path.suffix not in {'.json', '.md'}:
        continue
    text = path.read_text()
    cleaned = re.sub(r'/Users/[^/\s]+/Desktop/wow/artifacts/', '项目资料/', text)
    cleaned = re.sub(r'/Users/[^/\s]+/Desktop/wow/', '项目资料/', cleaned)
    cleaned = re.sub(r'\b(\d{2}):60(\.\d+)', lambda m: f'{int(m[1])+1:02d}:00{m[2]}', cleaned)
    if cleaned != text:
        path.write_text(cleaned)
        count += 1
print(f'已清理 {count} 份公开副本；原始研究材料未修改。')
