"use client";

import React, { useEffect, useRef } from "react";

const DEFAULT_FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
#define FC gl_FragCoord.xy
#define R resolution
#define T time
#define MN min(R.x,R.y)
float pattern(vec2 uv) {
  float d=.0;
  for (float i=.0; i<3.; i++) {
    uv.x+=sin(T*(1.+i)+uv.y*1.5)*.2;
    d+=.005/abs(uv.x);
  }
  return d;	
}
vec3 scene(vec2 uv) {
  vec3 col=vec3(0);
  uv=vec2(atan(uv.x,uv.y)*2./6.28318,-log(length(uv))+T);
  for (float i=.0; i<3.; i++) {
    int k=int(mod(i,3.));
    col[k]+=pattern(uv+i*6./MN);
  }
  return col;
}
void main() {
  vec2 uv=(FC-.5*R)/MN;
  vec3 col=vec3(0);
  float s=12., e=9e-4;
  col+=e/(sin(uv.x*s)*cos(uv.y*s));
  uv.y+=R.x>R.y?.5:.5*(R.y/R.x);
  col+=scene(uv);
  O=vec4(col,1.);
}`;

const VERT_SRC = `#version 300 es
precision highp float;
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

export default function PremiumBackground({
    children,
}: {
    children: React.ReactNode;
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const gl = canvas.getContext("webgl2", { alpha: true, antialias: true });
        if (!gl) return;

        const createProgram = (vs: string, fs: string) => {
            const compile = (src: string, type: number) => {
                const sh = gl.createShader(type)!;
                gl.shaderSource(sh, src);
                gl.compileShader(sh);
                if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                    throw new Error(gl.getShaderInfoLog(sh) || "Shader error");
                }
                return sh;
            };
            const v = compile(vs, gl.VERTEX_SHADER);
            const f = compile(fs, gl.FRAGMENT_SHADER);
            const prog = gl.createProgram()!;
            gl.attachShader(prog, v);
            gl.attachShader(prog, f);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                throw new Error(gl.getProgramInfoLog(prog) || "Program error");
            }
            return prog;
        };

        let prog: WebGLProgram;
        try {
            prog = createProgram(VERT_SRC, DEFAULT_FRAG);
        } catch (e) {
            console.error(e);
            return;
        }

        const verts = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);
        const buf = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        gl.useProgram(prog);
        const posLoc = gl.getAttribLocation(prog, "position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const uniTime = gl.getUniformLocation(prog, "time");
        const uniRes = gl.getUniformLocation(prog, "resolution");

        gl.clearColor(0, 0, 0, 1);

        const fit = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.getBoundingClientRect();
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(canvas);

        let frameId: number;
        const loop = (now: number) => {
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform2f(uniRes, canvas.width, canvas.height);
            gl.uniform1f(uniTime, now * 1e-3);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            frameId = requestAnimationFrame(loop);
        };
        frameId = requestAnimationFrame(loop);

        return () => {
            ro.disconnect();
            cancelAnimationFrame(frameId);
            gl.deleteBuffer(buf);
            gl.deleteProgram(prog);
        };
    }, []);

    return (
        <div className="relative min-h-screen w-full bg-black text-white selection:bg-purple-500/30">
            {/* Background Canvas */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full block pointer-events-none opacity-40"
            />

            {/* Dark Overlay for Readability */}
            <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
