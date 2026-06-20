package executor

// Spec describes how to run one language inside the sandbox.
//
//	Image    — the Docker image that contains the toolchain (network-isolated).
//	Filename — the file the user's source is written to (matters for Java/C#:
//	           the public class / entry must be named Main).
//	Cmd      — the shell snippet run inside /tmp/work (where the source is
//	           copied). It both compiles (if needed) and runs the program.
type Spec struct {
	Display  string
	Image    string
	Filename string
	Cmd      string
}

// Languages is the registry of supported runtimes. The images are standard
// public images; an operator pre-pulls them so execution works with
// `--network none`. TypeScript and C# use images that bundle their compilers.
var Languages = map[string]Spec{
	"python":     {Display: "Python 3", Image: "python:3.12-alpine", Filename: "main.py", Cmd: "python3 main.py"},
	"javascript": {Display: "JavaScript (Node)", Image: "node:20-alpine", Filename: "main.js", Cmd: "node main.js"},
	"typescript": {Display: "TypeScript", Image: "blh/ts-runner:latest", Filename: "main.ts", Cmd: "tsc main.ts && node main.js"},
	"c":          {Display: "C", Image: "gcc:13", Filename: "main.c", Cmd: "gcc -O2 main.c -o app && ./app"},
	"cpp":        {Display: "C++", Image: "gcc:13", Filename: "main.cpp", Cmd: "g++ -O2 -std=c++17 main.cpp -o app && ./app"},
	"csharp":     {Display: "C#", Image: "mono:latest", Filename: "Main.cs", Cmd: "mcs Main.cs -out:main.exe && mono main.exe"},
	"java":       {Display: "Java", Image: "eclipse-temurin:21-jdk", Filename: "Main.java", Cmd: "javac Main.java && java Main"},
	"go":         {Display: "Go", Image: "golang:1.22-alpine", Filename: "main.go", Cmd: "go run main.go"},
	"rust":       {Display: "Rust", Image: "rust:1-slim", Filename: "main.rs", Cmd: "rustc -O main.rs -o app && ./app"},
	"php":        {Display: "PHP", Image: "php:8.3-cli-alpine", Filename: "main.php", Cmd: "php main.php"},
	"ruby":       {Display: "Ruby", Image: "ruby:3.3-alpine", Filename: "main.rb", Cmd: "ruby main.rb"},
}

// LanguageInfo is the public listing returned by GET /languages.
type LanguageInfo struct {
	ID      string `json:"id"`
	Display string `json:"display"`
	Image   string `json:"image"`
}

// List returns the supported languages sorted by id, for the API.
func List() []LanguageInfo {
	out := make([]LanguageInfo, 0, len(Languages))
	for id, s := range Languages {
		out = append(out, LanguageInfo{ID: id, Display: s.Display, Image: s.Image})
	}
	return out
}
