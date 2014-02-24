ui-text-overrider
=================

UI要素のラベル、ツールチップテキストなどの文字列を変更する機能を提供します。

以下のような設定を定義すると、このアドオンは自動的に新しいラベルやツールチップテキストなどを反映します。

    user_pref("extensions.uitextoverrider@clear-code.com.sample",             "UI要素を特定するCSSセレクタ1");
    user_pref("extensions.uitextoverrider@clear-code.com.sample.label",       "新しいラベル1");
    user_pref("extensions.uitextoverrider@clear-code.com.sample.tooltiptext", "新しいツールチップテキスト1");
    user_pref("extensions.uitextoverrider@clear-code.com.sample.accesskey",   "新しいアクセスキー1");
    
    user_pref("extensions.uitextoverrider@clear-code.com.another",             "UI要素を特定するCSSセレクタ2");
    user_pref("extensions.uitextoverrider@clear-code.com.another.label",       "新しいラベル2");
    user_pref("extensions.uitextoverrider@clear-code.com.another.tooltiptext", "新しいツールチップテキスト2");
    user_pref("extensions.uitextoverrider@clear-code.com.another.accesskey",   "新しいアクセスキー2");
    // そのUI要素型のアドオンによって動的に追加される物である場合、確実にUI要素を更新できるように
    // 「delayed」フラグを設定する事をおすすめします。 
    user_pref("extensions.uitextoverrider@clear-code.com.another.delayed",     true);
    
    ...

例えば、以下の設定は「Firefox」ボタンのラベルを「Iceweasel」に変更します。

    user_pref("extensions.uitextoverrider@clear-code.com.appbutton",       "#appmenu-button");
    user_pref("extensions.uitextoverrider@clear-code.com.appbutton.label", "Iceweasel");

各属性値用の設定のベースとなる設定の値は、UI要素を特定するためのCSSセレクタ文字列です。
各属性値用の設定は、その子供となる設定名で指定します。

注意：このアドオンを無効化したりアンインストールしたりしても、変更したラベルはFirefoxを再起動するまでは元に戻りません。
