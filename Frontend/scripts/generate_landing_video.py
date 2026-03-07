import math
import os

import cv2
import numpy as np

W, H = 1800, 700
FPS = 24
DURATION = 8
N_FRAMES = FPS * DURATION
OUT_PATH = "Frontend/public/landing/scout-generated-video.mp4"


def main() -> None:
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    x = np.linspace(0.0, 1.0, W, dtype=np.float32)
    y = np.linspace(0.0, 1.0, H, dtype=np.float32)
    x_grid, y_grid = np.meshgrid(x, y)

    c_top = np.array([16, 9, 4], dtype=np.float32)
    c_mid = np.array([30, 15, 6], dtype=np.float32)
    c_bot = np.array([10, 6, 3], dtype=np.float32)

    writer = cv2.VideoWriter(
        OUT_PATH,
        cv2.VideoWriter_fourcc(*"avc1"),
        FPS,
        (W, H),
    )
    if not writer.isOpened():
        raise RuntimeError("Could not open video writer")

    px = np.linspace(290, 1300, 12)

    for frame_idx in range(N_FRAMES):
        t = frame_idx / FPS

        grad_v = np.where(y_grid < 0.5, y_grid * 2.0, (1.0 - y_grid) * 2.0)
        grad_diag = 0.5 + 0.5 * np.sin((x_grid * 2.1 - y_grid * 1.3) * math.pi + t * 0.9)

        base = (
            c_top * (1.0 - y_grid[..., None])
            + c_bot * y_grid[..., None]
            + c_mid * (0.35 * grad_v[..., None])
            + np.array([16, 28, 42], dtype=np.float32) * (0.18 * grad_diag[..., None])
        )
        frame = np.clip(base, 0, 255).astype(np.uint8)

        glow = np.zeros_like(frame)
        g1x = int(300 + 230 * math.sin(t * 1.15))
        g1y = int(170 + 80 * math.cos(t * 1.2))
        g2x = int(1280 + 200 * math.cos(t * 0.95 + 1.1))
        g2y = int(560 + 75 * math.sin(t * 1.05 + 0.5))
        cv2.circle(glow, (g1x, g1y), 170, (64, 118, 196), -1, cv2.LINE_AA)
        cv2.circle(glow, (g2x, g2y), 190, (34, 94, 208), -1, cv2.LINE_AA)
        frame = cv2.addWeighted(frame, 1.0, glow, 0.26, 0)

        cv2.rectangle(frame, (160, 80), (1640, 620), (26, 12, 6), thickness=-1)
        cv2.rectangle(frame, (160, 80), (1640, 620), (132, 178, 234), thickness=2)

        for gx in range(160, 1641, 44):
            cv2.line(frame, (gx, 80), (gx, 620), (20, 12, 8), 1)
        for gy in range(80, 621, 44):
            cv2.line(frame, (160, gy), (1640, gy), (20, 12, 8), 1)

        scan_y = 120 + int((t * 190) % 470)
        cv2.line(frame, (180, scan_y), (1620, scan_y), (84, 140, 210), 2)

        cv2.rectangle(frame, (245, 185), (715, 565), (22, 10, 4), thickness=-1)
        cv2.rectangle(frame, (245, 185), (715, 565), (92, 130, 176), thickness=2)

        cv2.rectangle(frame, (760, 165), (1475, 325), (24, 12, 5), thickness=-1)
        cv2.rectangle(frame, (760, 165), (1475, 325), (92, 130, 176), thickness=2)

        cv2.rectangle(frame, (760, 350), (1475, 585), (22, 10, 4), thickness=-1)
        cv2.rectangle(frame, (760, 350), (1475, 585), (92, 130, 176), thickness=2)

        cv2.rectangle(frame, (292, 230), (566, 246), (188, 218, 255), thickness=-1)
        cv2.rectangle(frame, (292, 260), (626, 272), (136, 182, 236), thickness=-1)
        cv2.rectangle(frame, (292, 284), (514, 296), (94, 146, 210), thickness=-1)

        pulse_x = int(780 + (t * 150) % 560)
        cv2.rectangle(frame, (pulse_x, 188), (pulse_x + 110, 315), (40, 84, 156), thickness=-1)
        cv2.rectangle(frame, (950, 198), (1125, 298), (58, 32, 14), thickness=-1)
        cv2.rectangle(frame, (1160, 220), (1360, 298), (84, 46, 20), thickness=-1)

        flick = 0.75 + 0.25 * math.sin(t * 8.0)
        cv2.rectangle(frame, (798, 402), (1454, 420), (int(146 * flick), int(192 * flick), 242), -1)
        cv2.rectangle(frame, (798, 436), (1382, 450), (int(112 * flick), int(160 * flick), 214), -1)
        cv2.rectangle(frame, (798, 462), (1286, 476), (int(82 * flick), int(126 * flick), 178), -1)

        main_pts = []
        soft_pts = []
        for xv in px:
            y_main = 572 - (xv - 290) * 0.24 + 34 * math.sin(t * 3.2 + xv * 0.017)
            y_soft = 608 - (xv - 290) * 0.21 + 22 * math.sin(t * 2.4 + xv * 0.013 + 0.9)
            main_pts.append((int(xv), int(y_main)))
            soft_pts.append((int(xv), int(y_soft)))

        p_main = np.array(main_pts, dtype=np.int32)
        p_soft = np.array(soft_pts, dtype=np.int32)

        cv2.polylines(frame, [p_main], False, (10, 6, 3), 18, cv2.LINE_AA)
        cv2.polylines(frame, [p_main], False, (72, 160, 245), 9, cv2.LINE_AA)
        cv2.polylines(frame, [p_soft], False, (144, 204, 250), 4, cv2.LINE_AA)

        for idx, (nx, ny) in enumerate(main_pts[::2]):
            pulse = 1.0 + 0.58 * math.sin(t * 5.6 + idx * 0.95)
            r_outer = max(7, int(10 * pulse))
            cv2.circle(frame, (nx, ny), r_outer, (42, 126, 232), -1, cv2.LINE_AA)
            cv2.circle(frame, (nx, ny), 6, (212, 234, 255), -1, cv2.LINE_AA)

        for k in range(6):
            phase = (t * 1.1 + k * 0.16) % 1.0
            idx = phase * (len(main_pts) - 1)
            lo = int(math.floor(idx))
            hi = min(lo + 1, len(main_pts) - 1)
            frac = idx - lo
            sx = int(main_pts[lo][0] * (1 - frac) + main_pts[hi][0] * frac)
            sy = int(main_pts[lo][1] * (1 - frac) + main_pts[hi][1] * frac)
            cv2.circle(frame, (sx, sy), 4, (238, 246, 255), -1, cv2.LINE_AA)

        ex, ey = main_pts[-1]
        arrow = np.array([[ex + 44, ey], [ex - 8, ey - 22], [ex - 8, ey + 22]], dtype=np.int32)
        cv2.fillPoly(frame, [arrow], (56, 148, 245), cv2.LINE_AA)

        off = int(6 * math.sin(t * 3.0))
        cv2.rectangle(frame, (212, 642 + off), (504, 764 + off), (24, 11, 5), thickness=-1)
        cv2.rectangle(frame, (212, 642 + off), (504, 764 + off), (118, 160, 214), thickness=2)
        cv2.circle(frame, (266, 704 + off), 14, (118, 182, 245), -1, cv2.LINE_AA)
        cv2.rectangle(frame, (298, 690 + off), (462, 702 + off), (178, 212, 252), -1)
        cv2.rectangle(frame, (298, 714 + off), (418, 726 + off), (124, 170, 225), -1)

        cv2.rectangle(frame, (1112, 642 - off), (1404, 764 - off), (24, 11, 5), thickness=-1)
        cv2.rectangle(frame, (1112, 642 - off), (1404, 764 - off), (118, 160, 214), thickness=2)
        cv2.circle(frame, (1166, 704 - off), 14, (62, 144, 245), -1, cv2.LINE_AA)
        cv2.rectangle(frame, (1198, 690 - off), (1360, 702 - off), (170, 206, 248), -1)
        cv2.rectangle(frame, (1198, 714 - off), (1312, 726 - off), (112, 160, 218), -1)

        writer.write(frame)

    writer.release()
    size_mb = os.path.getsize(OUT_PATH) / (1024 * 1024)
    print(f"Generated energetic video: {OUT_PATH}")
    print(f"Duration: {DURATION}s @ {FPS}fps")
    print(f"Size MB: {size_mb:.2f}")


if __name__ == "__main__":
    main()
