package main

import (
	_ "embed"
	"fmt"
	"io/fs"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
)

func makeDirs(root, dir string) []string {
	siteRoot := fmt.Sprintf("%s/site", root)
	srcRoot := fmt.Sprintf("%s/src", root)
	toMake := fmt.Sprintf("%s/%s", siteRoot, strings.TrimPrefix(strings.TrimPrefix(dir, srcRoot), "/"))
	var ret []string
	// TODO remove
	if strings.TrimPrefix(toMake, siteRoot) == "/builder" {
		return ret
	}
	if toMake != srcRoot {
		ret = append(ret, toMake)
	}
	err := os.MkdirAll(toMake, 0o755)
	files, err := os.ReadDir(dir)
	if err != nil {
		log.Fatal("Unable to read: ", dir, err)
	}
	for _, file := range files {
		if file.IsDir() {
			for _, v := range makeDirs(root, fmt.Sprintf("%s/%s", dir, file.Name())) {
				ret = append(ret, v)
			}
		}
	}
	return ret
}

func getRoot() string {
	out, err := exec.Command("git", "rev-parse", "--show-toplevel").Output()
	if err != nil {
		panic(err)
	}
	return strings.TrimSpace(string(out))
}

// Yoinked from README (https://github.com/gomarkdown/markdown)
func mdToHTML(md []byte) []byte {
	// create markdown parser with extensions
	extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
	p := parser.NewWithExtensions(extensions)
	doc := p.Parse(md)

	// create HTML renderer with extensions
	htmlFlags := html.CommonFlags | html.HrefTargetBlank
	opts := html.RendererOptions{Flags: htmlFlags}
	renderer := html.NewRenderer(opts)

	return markdown.Render(doc, renderer)
}

type FileData struct {
	Name string
	Data string
}

func copyFile(src string, dst string) {
	data, err := os.ReadFile(src)
	if err != nil {
		log.Fatal(err)
	}
	info, err := os.Stat(src)
	if err != nil {
		log.Fatal(err)
	}
	err = os.WriteFile(dst, data, info.Mode().Perm())
	if err != nil {
		log.Fatal(err)
	}
}

func processMarkdown(path string) FileData {
	b, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}
	html := mdToHTML(b)
	newFile := strings.Replace(strings.Replace(path, "/src/", "/site/", 1), ".md", ".html", 1)
	return FileData{Name: newFile, Data: string(html)}
}

type DirStructure struct {
	Sections  []string
	BlogPosts []FileData
	Demos     []FileData
}

func processFiles(root string) DirStructure {
	var sections []string
	var blogPosts []string
	var demos []string
	filepath.WalkDir(fmt.Sprintf("%s/src", root),
		func(path string, entry fs.DirEntry, err error) error {
			if err != nil {
				return err
			}
			out := strings.ReplaceAll(path, "/src/", "/site/")
			// Make Directories
			if entry.IsDir() {
				if strings.HasSuffix(path, "builder") {
					return filepath.SkipDir
				}
				os.MkdirAll(out, 0o755)
				// Don't make site or static nav-bar sections
				if out == fmt.Sprintf("%s/site", root) || out == fmt.Sprintf("%s/site/static", root) {
					return nil
				}
				trimmed := strings.TrimPrefix(out, fmt.Sprintf("%s/site/", root))
				// Don't add nested directories
				if strings.Count(trimmed, "/") > 0 {
					return nil
				}
				sections = append(sections, trimmed)

			} else {
				if strings.Contains(path, "/blog/") || strings.Contains(path, "/journal/") { // Blog Posts
					blogPosts = append(blogPosts, path)
				} else if strings.Contains(path, "/demos/") { // Demos
					demos = append(demos, path)
				} else { // All else
					copyFile(path, out)
				}
			}
			return nil
		})
	// Blog Posts and journal entries
	var htmlPosts []FileData
	for _, md := range blogPosts {
		htmlPosts = append(htmlPosts, processMarkdown(md))
	}
	var demoData []FileData
	for _, demo := range demos {
		data, err := os.ReadFile(demo)
		if err != nil {
			log.Fatal(err)
		}
		demoData = append(demoData, FileData{Name: strings.ReplaceAll(demo, "/src/", "/site/"), Data: string(data)})
	}
	ret := DirStructure{
		Sections:  sections,
		BlogPosts: htmlPosts,
		Demos:     demoData,
	}
	return ret
}

func main() {
	// Steps
	// Copy directory structure
	//     - Find root
	root := getRoot()
	// Process each file in root/src dir
	dirStruct := processFiles(root)
	// Apply blog templates
	var blogData []BlogData
	for _, f := range dirStruct.BlogPosts {
		b := BlogData{
			Name:  f.Name,
			NData: NavData{Sections: dirStruct.Sections},
			BData: f.Data,
		}
		blogData = append(blogData, b)
	}
	applyBlogTemplates(root, blogData)
	// Apply demo templates
	var demoData []DemoData
	for _, f := range dirStruct.Demos {
		d := DemoData{
			Name:  f.Name,
			NData: NavData{Sections: dirStruct.Sections},
			HData: HeaderData{
				Scripts: []string{
					"/static/js/p5.min.js",
					fmt.Sprintf("/static/js/%s.js", strings.TrimSuffix(strings.TrimPrefix(f.Name, fmt.Sprintf("%s/site/demos/", root)), ".html")),
				},
			},
			BData: f.Data,
		}
		demoData = append(demoData, d)
	}
	applyDemoTemplates(demoData)
	return
}
