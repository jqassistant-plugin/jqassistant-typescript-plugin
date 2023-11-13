package org.jqassistant.plugin.typescript.impl.model.core;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    property = "valueType")
@JsonSubTypes({
    @JsonSubTypes.Type(value = ValueNull.class, name = "null"),
    @JsonSubTypes.Type(value = ValueLiteral.class, name = "literal"),
    @JsonSubTypes.Type(value = ValueDeclared.class, name = "declared"),
    @JsonSubTypes.Type(value = ValueMember.class, name = "member"),
    @JsonSubTypes.Type(value = ValueObject.class, name = "object"),
    @JsonSubTypes.Type(value = ValueObjectProperty.class, name = "object-property"),
    @JsonSubTypes.Type(value = ValueArray.class, name = "array"),
    @JsonSubTypes.Type(value = ValueCall.class, name = "call"),
    @JsonSubTypes.Type(value = ValueFunction.class, name = "function"),
    @JsonSubTypes.Type(value = ValueClass.class, name = "class"),
    @JsonSubTypes.Type(value = ValueComplex.class, name = "complex"),
})
public abstract class Value {

    private Type type;

}
