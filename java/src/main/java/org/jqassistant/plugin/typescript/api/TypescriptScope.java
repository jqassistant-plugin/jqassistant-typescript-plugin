package org.jqassistant.plugin.typescript.api;

import com.buschmais.jqassistant.core.scanner.api.Scope;

import static com.google.common.base.CaseFormat.LOWER_HYPHEN;
import static com.google.common.base.CaseFormat.UPPER_UNDERSCORE;

public enum TypescriptScope implements Scope {

    PROJECT;

    @Override
    public String getPrefix() {
        return "typescript";
    }

    @Override
    public String getName() {
        return UPPER_UNDERSCORE.to(LOWER_HYPHEN, name());
    }
}
