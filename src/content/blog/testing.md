---
title: "测试"
description: "博客第一次搭建测试文章上传"
pubDate: "Apr 26 2026"
image: /image/testing_1.jpeg
categories:
  - Blog
tags:
  - blog
---
# 博客第一篇文章测试

## 一、文字

主播主播，什么是 undercut 什么是 overcut ？

所谓 undercut 和 overcut 都是使用进站完成超车的策略。所谓 undercut 指的是比对手早进站，让自己的排名先 under ，然后用新胎做出很快的圈速，在对手完成换胎出站之后，排在对手的前面完成超车。

所谓 overcut 指的是在对手进站之后，仍然留在赛道上，让自己的排名先 over ，然后用旧胎做出比对手更快的圈速，在自己进站之后出站排在对手的前面完成超车。

## 二、图片

#### Syntax

```markdown
![Alt text](./full/or/relative/path/of/image)
```

#### Output

![Pole Position](/image/testing_2.png)

![她真可爱](/image/testing_3.gif)

## 三、引用

The blockquote element represents content that is quoted from another source, optionally with a citation which must be within a `footer` or `cite` element, and optionally with in-line changes such as annotations and abbreviations.

### Blockquote without attribution

#### Syntax

```markdown
> Tiam, ad mint andaepu dandae nostion secatur sequo quae.
> **Note** that you can use _Markdown syntax_ within a blockquote.
```

#### Output

> Tiam, ad mint andaepu dandae nostion secatur sequo quae.
> **Note** that you can use _Markdown syntax_ within a blockquote.

### Blockquote with attribution

#### Syntax

```markdown
> Don't communicate by sharing memory, share memory by communicating.<br>
> — <cite>Rob Pike[^1]</cite>
```

#### Output

> Don't communicate by sharing memory, share memory by communicating.`<br>`
> — `<cite>`Rob Pike[^1] `</cite>`

## 四、表格

#### Syntax

```markdown
| Italics   | Bold     | Code   |
| --------- | -------- | ------ |
| _italics_ | **bold** | `code` |
```

#### Output

| Italics     | Bold           | Code     |
| ----------- | -------------- | -------- |
| _italics_ | **bold** | `code` |

## 五、代码块

#### Syntax

we can use 3 backticks ``` in new line and write snippet and close with 3 backticks on new line and to highlight language specific syntac, write one word of language name after first 3 backticks, for eg. html, javascript, css, markdown, typescript, txt, bash

````markdown
```cpp
#include <bits/stdc++.h>
using namespace std;
const int N = 1e5 + 5;
int n, k, a[N];
long long ans;
vector<int> v[N];
int main()
{
    scanf("%d%d", &n, &k);
    for (int i = 1; i <= n; i++)
    {
        scanf("%d", &a[i]);
        v[i % k].push_back(a[i]);
    }
    for (int i = 0; i < k; i++)
        sort(v[i].rbegin(), v[i].rend());
    for (int i = 0; i < k; i++)
    {
        for (int j = 0; j + 1 < v[i].size(); j += 2)
        {
            ans += v[i][j] + v[i][j + 1];
        }
    }
    printf("%lld\n", ans);
    return 0;
}
```
````

Output

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N = 1e5 + 5;
int n, k, a[N];
long long ans;
vector<int> v[N];
int main()
{
    scanf("%d%d", &n, &k);
    for (int i = 1; i <= n; i++)
    {
        scanf("%d", &a[i]);
        v[i % k].push_back(a[i]);
    }
    for (int i = 0; i < k; i++)
        sort(v[i].rbegin(), v[i].rend());
    for (int i = 0; i < k; i++)
    {
        for (int j = 0; j + 1 < v[i].size(); j += 2)
        {
            ans += v[i][j] + v[i][j + 1];
        }
    }
    printf("%lld\n", ans);
    return 0;
}
```

## 六、列表类型

### Ordered List

#### Syntax

```markdown
1. First item
2. Second item
3. Third item
```

#### Output

1. First item
2. Second item
3. Third item

### Unordered List

#### Syntax

```markdown
- List item
- Another item
- And another item
```

#### Output

- List item
- Another item
- And another item

### Nested list

#### Syntax

```markdown
- Fruit
  - Apple
  - Orange
  - Banana
- Dairy
  - Milk
  - Cheese
```

#### Output

- Fruit
  - Apple
  - Orange
  - Banana
- Dairy
  - Milk
  - Cheese

## 七、其他元素

#### Syntax

```markdown

<abbr title="Graphics Interchange Format">GIF</abbr> is a bitmap image format.

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

Press <kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>Delete</kbd> to end the session.

Most <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.

```

#### Output

`<abbr title="Graphics Interchange Format">` GIF `</abbr>` is a bitmap image format.

H `<sub>` 2 `</sub>`O

X `<sup>` n `</sup>` + Y `<sup>` n `</sup>` = Z `<sup>` n `</sup>`

Press `<kbd>` CTRL `</kbd>`+`<kbd>` ALT `</kbd>`+`<kbd>` Delete `</kbd>` to end the session.

Most `<mark>` salamanders `</mark>` are nocturnal, and hunt for insects, worms, and other small creatures.

<iframe width="100%" height="500" src="https://player.bilibili.com/player.html?bvid=BV1QbchzoEni&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
